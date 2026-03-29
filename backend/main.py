from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
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

RATES_TO_INR = {"INR": 1, "USD": 83.5, "EUR": 90.2, "GBP": 105.8}


def derive_status(steps):
    """Compute expense status from its approval steps."""
    if any(s["status"] == "rejected" for s in steps):
        return "rejected"
    if all(s["status"] == "approved" for s in steps):
        return "approved"
    return "pending"


def compute_progress(steps):
    """0 = submitted, 50 = manager done, 100 = all done."""
    total = len(steps)
    done = sum(1 for s in steps if s["status"] in ("approved", "rejected"))
    if total == 0:
        return 0
    return int((done / total) * 100)


# ────────────────────────── USERS ──────────────────────────

@app.get("/api/users")
def get_users():
    res = supabase.table("users").select("*").order("id").execute()
    return res.data


@app.get("/api/users/{user_id}")
def get_user(user_id: int):
    res = supabase.table("users").select("*").eq("id", user_id).single().execute()
    return res.data


@app.patch("/api/users/{user_id}/hierarchy")
def update_hierarchy(user_id: int, body: HierarchyUpdate):
    """Admin: assign role and/or manager to a user."""
    updates = {}
    if body.role is not None:
        updates["role"] = body.role
    if body.manager_id is not None:
        updates["manager_id"] = body.manager_id
    if not updates:
        raise HTTPException(400, "Nothing to update")
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
def get_expenses(user_id: int = None):
    """Employee: pass ?user_id=4 to get own expenses. No param = all."""
    query = supabase.table("expenses").select("*").order("id", desc=True)
    if user_id:
        query = query.eq("user_id", user_id)
    res = query.execute()
    return _enrich_expenses(res.data)


@app.get("/api/expenses/all")
def get_all_expenses():
    """Admin: get every expense."""
    res = supabase.table("expenses").select("*").order("id", desc=True).execute()
    return _enrich_expenses(res.data)


@app.post("/api/expenses")
def create_expense(body: ExpenseCreate):
    """
    Dynamic Rule Engine:
    1. Check if employee has a manager → if yes, create Manager step.
       If no manager, skip straight to Admin/Finance step.
    2. Fetch all active rules and evaluate them against this expense.
       - percentage rule: if display_amount > threshold, add Admin step
       - specific rule: if category matches, always add Admin step
       - hybrid rule: if category matches AND display_amount > threshold, add Admin step
    3. If no rules trigger AND manager exists, manager approval is final.
    """
    user_res = supabase.table("users").select("*").eq("id", body.user_id).single().execute()
    user = user_res.data
    manager_id = user.get("manager_id")

    # Insert expense
    expense_data = {
        "user_id": body.user_id,
        "category": body.category,
        "amount": body.amount,
        "currency": body.currency,
        "display_amount": body.display_amount,
        "date": body.date,
        "description": body.description,
        "receipt": body.receipt,
        "comments": body.comments,
        "status": "pending",
        "progress": 0,
    }
    exp_res = supabase.table("expenses").insert(expense_data).execute()
    new_expense = exp_res.data[0]

    # ── Step 1: Hierarchy check ──
    steps = []
    step_order = 1

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
    rules_res = supabase.table("rules").select("*").eq("active", True).execute()
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


# ────────────────────────── MANAGER ──────────────────────────

@app.get("/api/manager/expenses")
def get_pending_for_manager(manager_id: int):
    """Manager: get all pending expenses for employees they manage."""
    # Get employee IDs under this manager
    emp_res = supabase.table("users").select("id").eq("manager_id", manager_id).execute()
    emp_ids = [e["id"] for e in emp_res.data]
    if not emp_ids:
        return []
    res = supabase.table("expenses").select("*").in_("user_id", emp_ids).eq("status", "pending").order("id", desc=True).execute()
    return _enrich_expenses(res.data)


@app.get("/api/manager/history")
def get_history_for_manager(manager_id: int):
    """Manager: get past approvals/rejects for employees they manage."""
    emp_res = supabase.table("users").select("id").eq("manager_id", manager_id).execute()
    emp_ids = [e["id"] for e in emp_res.data]
    if not emp_ids:
        return []
    res = supabase.table("expenses").select("*").in_("user_id", emp_ids).neq("status", "pending").order("id", desc=True).execute()
    return _enrich_expenses(res.data)


@app.patch("/api/expenses/{expense_id}/action")
def process_expense_action(expense_id: int, body: ExpenseAction):
    """Manager/Finance: approve or reject the next pending step."""
    # Get all steps for this expense
    steps_res = supabase.table("approval_steps").select("*").eq("expense_id", expense_id).order("step_order").execute()
    steps = steps_res.data

    # Find first pending step
    target_step = None
    for s in steps:
        if s["status"] == "pending":
            target_step = s
            break

    if not target_step:
        raise HTTPException(400, "No pending approval steps remaining")

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
def report_employee(body: ReportEmployee):
    """Manager: report an employee → sends notification to all admins."""
    employee_res = supabase.table("users").select("name").eq("id", body.employee_id).single().execute()
    emp_name = employee_res.data["name"]

    admins_res = supabase.table("users").select("id").eq("role", "Admin").execute()
    notifications = [
        {
            "recipient_id": admin["id"],
            "message": f"Employee {emp_name} reported: {body.reason}",
            "type": "REPORT_EMPLOYEE",
        }
        for admin in admins_res.data
    ]
    if notifications:
        supabase.table("notifications").insert(notifications).execute()
    return {"ok": True, "message": f"Report filed for {emp_name}"}


# ────────────────────────── ADMIN ──────────────────────────

@app.patch("/api/expenses/{expense_id}/override")
def override_expense(expense_id: int, body: ExpenseOverride):
    """Admin: force-override all approval steps and notify manager + employee."""
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
    expense_res = supabase.table("expenses").select("*").eq("id", expense_id).single().execute()
    expense = expense_res.data

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
def get_notifications(user_id: int):
    res = supabase.table("notifications").select("*").eq("recipient_id", user_id).order("created_at", desc=True).execute()
    return res.data


@app.patch("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int):
    supabase.table("notifications").update({"read": True}).eq("id", notif_id).execute()
    return {"ok": True}


# ────────────────────────── RULES ──────────────────────────

@app.get("/api/rules")
def get_rules():
    res = supabase.table("rules").select("*").order("id").execute()
    return res.data


@app.post("/api/rules")
def create_rule(body: RuleCreate):
    res = supabase.table("rules").insert({
        "name": body.name,
        "type": body.type,
        "value_str": body.value_str,
        "threshold": body.threshold,
        "category": body.category,
        "approver_role": body.approver_role,
        "active": True,
    }).execute()
    return res.data[0]


@app.patch("/api/rules/{rule_id}")
def toggle_rule(rule_id: int, body: RuleToggle):
    res = supabase.table("rules").update({"active": body.active}).eq("id", rule_id).execute()
    return res.data
