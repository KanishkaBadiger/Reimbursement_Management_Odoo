from pydantic import BaseModel
from typing import Optional

# ---------- Request Schemas ----------

class ExpenseCreate(BaseModel):
    user_id: int
    category: str            # Travel | Meals | Software | Office | Other
    amount: float
    currency: str            # INR | USD | EUR | GBP
    display_amount: float    # pre-computed on frontend
    date: str                # YYYY-MM-DD
    description: str
    receipt: Optional[str] = None
    comments: Optional[str] = None

class ExpenseAction(BaseModel):
    action: str              # "approved" | "rejected"
    comments: Optional[str] = None

class ExpenseOverride(BaseModel):
    new_status: str          # "approved" | "rejected"
    admin_comment: Optional[str] = None

class RuleCreate(BaseModel):
    name: str
    type: str                          # percentage | specific | hybrid
    value_str: str
    threshold: float = 0               # amount threshold in INR
    category: Optional[str] = None     # category filter (Travel, Meals, etc.)
    approver_role: str = "Admin"       # role of the extra approver

class RuleToggle(BaseModel):
    active: bool

class HierarchyUpdate(BaseModel):
    role: Optional[str] = None
    manager_id: Optional[int] = None

class ReportEmployee(BaseModel):
    employee_id: int
    reason: str
