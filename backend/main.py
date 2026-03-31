from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import supabase, supabase_admin
import requests
from pydantic import BaseModel
from models import (
    ExpenseCreate, ExpenseAction, ExpenseOverride,
    RuleCreate, RuleToggle, HierarchyUpdate, ReportEmployee
)

app = FastAPI(title="ReimburseOS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(authorization: str = Header(None)):
    """Verify JWT token and return public.users record."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    
    try:
        # Verify via supabase to ensure token isn't revoked and is valid
        auth_res = supabase.auth.get_user(token)
        if not auth_res or not hasattr(auth_res, 'user') or not auth_res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        auth_id = auth_res.user.id
        email = auth_res.user.email
        
        # Load user profile from public.users
        user_res = supabase.table("users").select("*").eq("auth_id", auth_id).execute()
        
        if not user_res.data:
            # We are in a state where auth.users exists but public.users doesn't.
            # This happens immediately after signup before /api/auth/init is called.
            # Return a special dict so the init endpoint can authorize the caller.
            return {"_auth_id": auth_id, "_email": email, "is_new_signup": True}
            
        return user_res.data[0]
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


class InitCompanyRequest(BaseModel):
    company_name: str
    country: str
    admin_name: str

@app.post("/api/auth/init")
def init_company(body: InitCompanyRequest, user=Depends(get_current_user)):
    """Called immediately after successful Supabase signup to provision company."""
    if not user.get("is_new_signup"):
        raise HTTPException(400, "User is already initialized.")
        
    auth_id = user["_auth_id"]
    email = user["_email"]
    
    # Fetch country currency dynamically (Requirement from PRD)
    default_currency = "USD"
    try:
        resp = requests.get(f"https://restcountries.com/v3.1/name/{body.country}?fullText=true")
        if resp.status_code == 200:
            data = resp.json()[0]
            currencies = data.get("currencies", {})
            if currencies:
                default_currency = list(currencies.keys())[0]
    except Exception:
        pass # Fallback to USD
        
    # 1. Create Company
    company_res = supabase.table("companies").insert({
        "name": body.company_name,
        "country": body.country,
        "default_currency": default_currency
    }).execute()
    company_id = company_res.data[0]["id"]
    
    # 2. Create User as Admin
    user_res = supabase.table("users").insert({
        "auth_id": auth_id,
        "email": email,
        "name": body.admin_name,
        "department": "Management",
        "role": "Admin",
        "company_id": company_id
    }).execute()
    
    return {"message": "Initialization complete", "user": user_res.data[0], "company_id": company_id, "currency": default_currency}


def derive_status(steps):
    """Compute expense status from its approval steps based on consensus / override rules."""
    from collections import defaultdict
    steps_by_order = defaultdict(list)
    for s in steps:
        steps_by_order[s["step_order"]].append(s)

    for order in sorted(steps_by_order.keys()):
        stage_steps = steps_by_order[order]
        is_consensus = any(s["role"] == "Consensus" for s in stage_steps)

        if is_consensus:
            approved_count = sum(1 for s in stage_steps if s["status"] == "approved")
            rejected_count = sum(1 for s in stage_steps if s["status"] == "rejected")
            total = len(stage_steps)
            
            # 60% minimum consensus required
            if approved_count / total >= 0.6:
                continue # stage passed
            
            remaining = total - approved_count - rejected_count
            if (approved_count + remaining) / total < 0.6:
                return "rejected"
            return "pending"
        else:
            step = stage_steps[0]
            if step["status"] == "rejected":
                return "rejected"
            if step["status"] == "pending":
                return "pending"
    return "approved"


def compute_progress(steps):
    """0 = submitted, intermediate, 100 = all done."""
    from collections import defaultdict
    steps_by_order = defaultdict(list)
    for s in steps:
        steps_by_order[s["step_order"]].append(s)
        
    total_stages = len(steps_by_order)
    if total_stages == 0: return 0
    
    completed_stages = 0
    for order in sorted(steps_by_order.keys()):
        stage_steps = steps_by_order[order]
        is_consensus = any(s["role"] == "Consensus" for s in stage_steps)
        if is_consensus:
            approved = sum(1 for s in stage_steps if s["status"] == "approved")
            if approved / len(stage_steps) >= 0.6:
                completed_stages += 1
            elif any(s["status"] == "rejected" for s in stage_steps):
                # if rejected early
                pass
        else:
            if stage_steps[0]["status"] in ("approved", "rejected"):
                completed_stages += 1
                
    return int((completed_stages / total_stages) * 100)


# ────────────────────────── USERS ──────────────────────────

@app.get("/api/users")
def get_users(current_user=Depends(get_current_user)):
    if current_user.get("is_new_signup"): raise HTTPException(401)
    res = supabase.table("users").select("*").eq("company_id", current_user["company_id"]).order("id").execute()
    return res.data

from models import CreateUserRequest

@app.post("/api/users")
def create_user(body: CreateUserRequest, current_user=Depends(get_current_user)):
    """Admin creates a real user."""
    if current_user.get("is_new_signup") or current_user["role"] != "Admin": raise HTTPException(401)
    
    from database import SUPABASE_SERVICE_KEY
    if not SUPABASE_SERVICE_KEY:
        raise HTTPException(status_code=500, detail="Cannot invite users: SUPABASE_SERVICE_KEY is missing in backend/.env. Please add your Supabase service_role secret key to invite employees.")

    # 1. Create the user in Supabase Auth (admin API bypasses signup rate limits usually)
    try:
        auth_res = supabase_admin.auth.admin.create_user({
            "email": body.email,
            "password": body.password,
            "email_confirm": True
        })
    except Exception as e:
        if "User not allowed" in str(e):
            raise HTTPException(status_code=500, detail="SUPABASE_SERVICE_KEY is invalid or missing.")
        raise HTTPException(status_code=400, detail=str(e))
    
    new_auth_id = auth_res.user.id
    
    # 2. Insert into public.users
    user_res = supabase.table("users").insert({
        "auth_id": new_auth_id,
        "email": body.email,
        "name": body.name,
        "department": body.department,
        "role": body.role,
        "company_id": current_user["company_id"]
    }).execute()
    
    return user_res.data[0]


@app.get("/api/users/me")
def get_user_me(current_user=Depends(get_current_user)):
    return current_user


@app.get("/api/users/{user_id}")
def get_user(user_id: int, current_user=Depends(get_current_user)):
    res = supabase.table("users").select("*").eq("id", user_id).eq("company_id", current_user["company_id"]).single().execute()
    return res.data


@app.patch("/api/users/{user_id}/hierarchy")
def update_hierarchy(user_id: int, body: HierarchyUpdate, current_user=Depends(get_current_user)):
    """Admin: assign role and/or manager to a user."""
    if current_user["role"] != "Admin":
        raise HTTPException(403, "Admins only")
        
    updates = {}
    if body.role is not None:
        updates["role"] = body.role
    if body.manager_id is not None:
        updates["manager_id"] = body.manager_id
    if not updates:
        raise HTTPException(400, "Nothing to update")
        
    # Ensure target user belongs to the same company
    target = supabase.table("users").select("id").eq("id", user_id).eq("company_id", current_user["company_id"]).execute()
    if not target.data:
        raise HTTPException(404, "Target user not found")
        
    res = supabase.table("users").update(updates).eq("id", user_id).execute()
    return res.data


# ────────────────────────── EXPENSES ──────────────────────────

def _enrich_expenses(expenses):
    """Attach approval_steps and employee name to each expense."""
    if not expenses:
        return []
    expense_ids = [e["id"] for e in expenses]
    user_ids = list({e["user_id"] for e in expenses})

    steps_res = supabase.table("approval_steps").select("*").in_("expense_id", expense_ids).order("step_order").execute()
    users_res = supabase.table("users").select("id, name").in_("id", user_ids).execute()

    steps_by_expense = {}
    for s in steps_res.data:
        steps_by_expense.setdefault(s["expense_id"], []).append(s)

    user_map = {u["id"]: u["name"] for u in users_res.data}

    # Also get approver names
    approver_ids = list({s["approver_id"] for s in steps_res.data if s.get("approver_id")})
    if approver_ids:
        approvers_res = supabase.table("users").select("id, name").in_("id", approver_ids).execute()
        approver_map = {u["id"]: u["name"] for u in approvers_res.data}
    else:
        approver_map = {}

    enriched = []
    for e in expenses:
        raw_steps = steps_by_expense.get(e["id"], [])
        steps_with_names = []
        for s in raw_steps:
            step_copy = dict(s)
            step_copy["approver_name"] = approver_map.get(s.get("approver_id"), "Unknown")
            steps_with_names.append(step_copy)

        e["employee"] = user_map.get(e["user_id"], "Unknown")
        e["approvalSteps"] = steps_with_names
        enriched.append(e)
    return enriched


@app.get("/api/expenses")
def get_expenses(user_id: int = None, current_user=Depends(get_current_user)):
    """Employee mode: return own expenses. Can theoretically take ?user_id for managers viewing specific employees."""
    query = supabase.table("expenses").select("*").order("id", desc=True)
    
    # If the user is an Employee, they can ONLY see their own expenses
    if current_user["role"] == "Employee":
        query = query.eq("user_id", current_user["id"])
    elif user_id:
        query = query.eq("user_id", user_id)
        
    res = query.execute()
    # Need to filter the final results to ensure they belong to the current_user's company.
    # We do this post-fetch or by joining users, but since users belong to company, we can filter in _enrich
    expenses = res.data
    return _enrich_expenses(expenses)


@app.get("/api/expenses/all")
def get_all_expenses(current_user=Depends(get_current_user)):
    """Admin: get every expense in their company."""
    if current_user["role"] != "Admin":
        raise HTTPException(403, "Admins only")
        
    # Get all users in this company
    users_res = supabase.table("users").select("id").eq("company_id", current_user["company_id"]).execute()
    company_user_ids = [u["id"] for u in users_res.data]
    
    if not company_user_ids:
        return []
        
    res = supabase.table("expenses").select("*").in_("user_id", company_user_ids).order("id", desc=True).execute()
    return _enrich_expenses(res.data)


@app.post("/api/expenses")
def create_expense(body: ExpenseCreate, current_user=Depends(get_current_user)):
    """
    Dynamic Rule Engine:
    1. Check if employee has a manager → if yes, create Manager step.
       If no manager, skip straight to Admin/Finance step.
    2. Fetch all active rules and evaluate them against this expense.
    """
    user = current_user
    manager_id = user.get("manager_id")
    company_id = user.get("company_id")
    
    company_res = supabase.table("companies").select("default_currency").eq("id", company_id).single().execute()
    default_currency = company_res.data["default_currency"]
    
    display_amount = body.amount
    if body.currency.upper() != default_currency.upper():
        try:
            resp = requests.get(f"https://api.exchangerate-api.com/v4/latest/{body.currency.upper()}")
            if resp.status_code == 200:
                rates = resp.json().get("rates", {})
                target_rate = rates.get(default_currency.upper(), 1)
                display_amount = body.amount * target_rate
        except Exception as e:
            print("Currency conversion error", e)

    # Insert expense
    expense_data = {
        "user_id": user["id"],
        "category": body.category,
        "amount": body.amount,
        "currency": body.currency,
        "display_amount": display_amount,
        "date": body.date,
        "description": body.description,
        "receipt": body.receipt,
        "comments": body.comments,
        "status": "pending",
        "progress": 0,
    }
    exp_res = supabase.table("expenses").insert(expense_data).execute()
    new_expense = exp_res.data[0]

    # ── Step 1: Handling "Software" category 60% Consensus Rule ──
    steps = []
    step_order = 1
    
    if body.category.lower() == "software":
        # Find all Admins and Managers for this company to act as Consensus pool
        pool_res = supabase.table("users") \
            .select("id") \
            .eq("company_id", company_id) \
            .in_("role", ["Admin", "Manager"]) \
            .neq("id", user["id"]) \
            .execute()
        pool = pool_res.data
        if not pool:
            # Fallback if no pool available, just force admin review
            pool = [{"id": 1}]
            
        for p in pool:
            steps.append({
                "expense_id": new_expense["id"],
                "role": "Consensus",
                "approver_id": p["id"],
                "status": "pending",
                "step_order": step_order,
            })
    else:
        # ── Traditional Hierarchy ──
        if manager_id:
            # Employee has a manager → create Manager approval step
            steps.append({
                "expense_id": new_expense["id"],
                "role": "Manager",
                "approver_id": manager_id,
                "status": "pending",
                "step_order": step_order,
            })
            step_order += 1

        # ── Step 2: Rule engine ──
        rules_res = supabase.table("rules").select("*").eq("active", True).eq("company_id", company_id).execute()
        active_rules = rules_res.data
        needs_admin_step = False

        for rule in active_rules:
            threshold = float(rule.get("threshold") or 0)
            rule_category = rule.get("category")
            rule_type = rule.get("type", "percentage")

            if rule_type == "percentage":
                # Trigger if expense amount exceeds the threshold
                if body.display_amount > threshold and threshold > 0:
                    needs_admin_step = True
                    break
            elif rule_type == "specific":
                # Trigger if category matches (always needs admin for this category)
                if rule_category and body.category.lower() == rule_category.lower():
                    needs_admin_step = True
                    break
            elif rule_type == "hybrid":
                # Trigger if BOTH category matches AND amount exceeds threshold
                cat_match = rule_category and body.category.lower() == rule_category.lower()
                amt_match = body.display_amount > threshold and threshold > 0
                if cat_match and amt_match:
                    needs_admin_step = True
                    break

        # If no manager exists, we MUST have at least one approver
        if not manager_id:
            needs_admin_step = True

        if needs_admin_step:
            # Find a Finance/Admin user for the admin step
            finance_res = supabase.table("users").select("id").eq("role", "Admin").neq("id", 1).limit(1).execute()
            finance_id = finance_res.data[0]["id"] if finance_res.data else 1
            steps.append({
                "expense_id": new_expense["id"],
                "role": "Finance",
                "approver_id": finance_id,
                "status": "pending",
                "step_order": step_order,
            })

    # Insert all computed steps
    if steps:
        supabase.table("approval_steps").insert(steps).execute()

    # ── Notifications ──
    if manager_id:
        supabase.table("notifications").insert({
            "recipient_id": manager_id,
            "message": f"New expense submitted by {user['name']}: {body.description} (₹{body.display_amount:,.0f})",
            "type": "EXPENSE_SUBMITTED",
        }).execute()

    return _enrich_expenses([new_expense])[0]


@app.get("/api/manager/expenses")
def get_pending_for_manager(manager_id: int = None, current_user=Depends(get_current_user)):
    """Manager: get all pending expenses assigned to this user's approval queue."""
    # We find all approval steps assigned to this user that are 'pending'
    steps_res = supabase.table("approval_steps").select("expense_id").eq("approver_id", current_user["id"]).eq("status", "pending").execute()
    expense_ids = list(set([s["expense_id"] for s in steps_res.data]))
    
    if not expense_ids:
        return []
        
    res = supabase.table("expenses").select("*").in_("id", expense_ids).eq("status", "pending").order("id", desc=True).execute()
    return _enrich_expenses(res.data)


@app.get("/api/manager/history")
def get_history_for_manager(manager_id: int = None, current_user=Depends(get_current_user)):
    """Manager: get past approvals/rejects this user acted upon."""
    steps_res = supabase.table("approval_steps").select("expense_id").eq("approver_id", current_user["id"]).neq("status", "pending").execute()
    expense_ids = list(set([s["expense_id"] for s in steps_res.data]))
    
    if not expense_ids:
        return []
        
    res = supabase.table("expenses").select("*").in_("id", expense_ids).order("id", desc=True).execute()
    return _enrich_expenses(res.data)


@app.patch("/api/expenses/{expense_id}/action")
def process_expense_action(expense_id: int, body: ExpenseAction, current_user=Depends(get_current_user)):
    """Manager/Finance: approve or reject the next pending step."""
    # Get all steps for this expense
    steps_res = supabase.table("approval_steps").select("*").eq("expense_id", expense_id).order("step_order").execute()
    steps = steps_res.data

    # Find the active stage order (the lowest step_order that still has pending steps)
    active_order = None
    for s in steps:
        if s["status"] == "pending":
            active_order = s["step_order"]
            break

    if active_order is None:
        raise HTTPException(400, "No pending approval steps remaining")

    # Find the specific step assigned to the current user in this active stage
    target_step = None
    for s in steps:
        if s["step_order"] == active_order and s["status"] == "pending" and s["approver_id"] == current_user["id"]:
            target_step = s
            break

    if not target_step and current_user["role"] != "Admin":
        raise HTTPException(403, "Not your turn to approve")
        
    if not target_step:
        # Admin is trying to act on a step they aren't assigned to.
        # Admins should use the /override endpoint instead to bypass the queue.
        raise HTTPException(403, "Not assigned to this approval step.")

    # Update that step
    supabase.table("approval_steps").update({"status": body.action}).eq("id", target_step["id"]).execute()

    # Update comments if provided
    if body.comments:
        supabase.table("expenses").update({"comments": body.comments}).eq("id", expense_id).execute()

    # Re-fetch steps and derive status + progress
    updated_steps_res = supabase.table("approval_steps").select("*").eq("expense_id", expense_id).order("step_order").execute()
    updated_steps = updated_steps_res.data
    new_status = derive_status(updated_steps)
    new_progress = compute_progress(updated_steps)

    supabase.table("expenses").update({"status": new_status, "progress": new_progress}).eq("id", expense_id).execute()

    # Notify employee about the action
    expense_res = supabase.table("expenses").select("*, users!expenses_user_id_fkey(name)").eq("id", expense_id).single().execute()
    expense = expense_res.data
    employee_id = expense["user_id"]
    supabase.table("notifications").insert({
        "recipient_id": employee_id,
        "message": f"Your expense \"{expense['description']}\" was {body.action} by {target_step['role']}.",
        "type": "APPROVAL_UPDATE",
    }).execute()

    # Return updated expense
    final_res = supabase.table("expenses").select("*").eq("id", expense_id).execute()
    return _enrich_expenses(final_res.data)[0]


@app.post("/api/manager/report")
def report_employee(body: ReportEmployee, current_user=Depends(get_current_user)):
    """Manager: report an employee → sends notification to all admins."""
    employee_res = supabase.table("users").select("name").eq("id", body.employee_id).single().execute()
    emp_name = employee_res.data["name"]

    admins_res = supabase.table("users").select("id").eq("role", "Admin").eq("company_id", current_user["company_id"]).execute()
    notifications = [
        {
            "recipient_id": admin["id"],
            "message": f"Employee {emp_name} reported by {current_user['name']}: {body.reason}",
            "type": "REPORT_EMPLOYEE",
        }
        for admin in admins_res.data
    ]
    if notifications:
        supabase.table("notifications").insert(notifications).execute()
    return {"ok": True, "message": f"Report filed for {emp_name}"}


# ────────────────────────── ADMIN ──────────────────────────

@app.patch("/api/expenses/{expense_id}/override")
def override_expense(expense_id: int, body: ExpenseOverride, current_user=Depends(get_current_user)):
    """Admin: force-override all approval steps and notify manager + employee."""
    if current_user["role"] != "Admin": raise HTTPException(403)
        
    # Check expense belongs to this company implicitly by checking user's company_id
    expense_res = supabase.table("expenses").select("*, users!inner(company_id)").eq("id", expense_id).single().execute()
    expense = expense_res.data
    
    if expense["users"]["company_id"] != current_user["company_id"]: raise HTTPException(403)

    # Set all steps to the override status
    supabase.table("approval_steps").update({"status": body.new_status}).eq("expense_id", expense_id).execute()

    # Update expense
    progress = 100
    supabase.table("expenses").update({
        "status": body.new_status,
        "progress": progress,
        "comments": body.admin_comment or "",
    }).eq("id", expense_id).execute()

    # Notify both the manager and the employee

    user_res = supabase.table("users").select("*, manager:manager_id(id, name)").eq("id", expense["user_id"]).single().execute()
    user = user_res.data

    notifs = [
        {
            "recipient_id": expense["user_id"],
            "message": f"Admin override: your expense \"{expense['description']}\" was {body.new_status}.",
            "type": "OVERRIDE_ACTION",
        },
    ]
    if user.get("manager") and user["manager"].get("id"):
        notifs.append({
            "recipient_id": user["manager"]["id"],
            "message": f"Admin override on {user['name']}'s expense \"{expense['description']}\" → {body.new_status}.",
            "type": "OVERRIDE_ACTION",
        })
    supabase.table("notifications").insert(notifs).execute()

    final_res = supabase.table("expenses").select("*").eq("id", expense_id).execute()
    return _enrich_expenses(final_res.data)[0]


# ────────────────────────── NOTIFICATIONS ──────────────────────────

@app.get("/api/notifications")
def get_notifications(current_user=Depends(get_current_user)):
    if current_user.get("is_new_signup"): return []
    res = supabase.table("notifications").select("*").eq("recipient_id", current_user["id"]).order("created_at", desc=True).execute()
    return res.data


@app.patch("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, current_user=Depends(get_current_user)):
    supabase.table("notifications").update({"read": True}).eq("id", notif_id).eq("recipient_id", current_user["id"]).execute()
    return {"ok": True}


# ────────────────────────── RULES ──────────────────────────

@app.get("/api/rules")
def get_rules(current_user=Depends(get_current_user)):
    res = supabase.table("rules").select("*").eq("company_id", current_user["company_id"]).order("id").execute()
    return res.data


@app.post("/api/rules")
def create_rule(body: RuleCreate, current_user=Depends(get_current_user)):
    if current_user["role"] != "Admin": raise HTTPException(403)
    res = supabase.table("rules").insert({
        "name": body.name,
        "type": body.type,
        "value_str": body.value_str,
        "threshold": body.threshold,
        "category": body.category,
        "approver_role": body.approver_role,
        "active": True,
        "company_id": current_user["company_id"]
    }).execute()
    return res.data[0]


@app.patch("/api/rules/{rule_id}")
def toggle_rule(rule_id: int, body: RuleToggle, current_user=Depends(get_current_user)):
    if current_user["role"] != "Admin": raise HTTPException(403)
    res = supabase.table("rules").update({"active": body.active}).eq("id", rule_id).eq("company_id", current_user["company_id"]).execute()
    return res.data
