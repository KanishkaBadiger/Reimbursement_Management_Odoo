export const RATES_TO_INR = {
  INR: 1,
  USD: 83.5,
  EUR: 90.2,
  GBP: 105.8,
}

export function deriveStatus(approvalSteps) {
  if (approvalSteps.some(s => s.status === "rejected")) return "rejected"
  if (approvalSteps.every(s => s.status === "approved")) return "approved"
  return "pending"
}

export const SEEDED_EXPENSES = [
  {
    id: 1,
    employee: "Arjun Mehta",
    category: "Travel",
    amount: 4200,
    currency: "INR",
    displayAmount: 4200 * RATES_TO_INR["INR"],
    date: "2025-03-18",
    description: "Mumbai client visit",
    receipt: true,
    receiptFile: null,
    comments: "",
    status: deriveStatus([
      { role: "Manager", approver: "Sanjay Rao", status: "approved" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]),
    approvalSteps: [
      { role: "Manager", approver: "Sanjay Rao", status: "approved" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]
  },
  {
    id: 2,
    employee: "Priya Sharma",
    category: "Software",
    amount: 50,
    currency: "USD",
    displayAmount: 50 * RATES_TO_INR["USD"],
    date: "2025-03-20",
    description: "Figma Subscription",
    receipt: true,
    receiptFile: null,
    comments: "",
    status: deriveStatus([
      { role: "Manager", approver: "Sanjay Rao", status: "pending" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]),
    approvalSteps: [
      { role: "Manager", approver: "Sanjay Rao", status: "pending" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]
  },
  {
    id: 3,
    employee: "Vikram Nair",
    category: "Meals",
    amount: 1500,
    currency: "INR",
    displayAmount: 1500 * RATES_TO_INR["INR"],
    date: "2025-03-21",
    description: "Team lunch",
    receipt: false,
    receiptFile: null,
    comments: "No receipt attached, rejected per policy.",
    status: deriveStatus([
      { role: "Manager", approver: "Sanjay Rao", status: "rejected" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]),
    approvalSteps: [
      { role: "Manager", approver: "Sanjay Rao", status: "rejected" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]
  },
  {
    id: 4,
    employee: "Sneha Joshi",
    category: "Office",
    amount: 8000,
    currency: "INR",
    displayAmount: 8000 * RATES_TO_INR["INR"],
    date: "2025-03-22",
    description: "New ergonomic chairs",
    receipt: true,
    receiptFile: null,
    comments: "",
    status: deriveStatus([
      { role: "Manager", approver: "Sanjay Rao", status: "approved" },
      { role: "Finance", approver: "Neha Kulkarni", status: "approved" },
    ]),
    approvalSteps: [
      { role: "Manager", approver: "Sanjay Rao", status: "approved" },
      { role: "Finance", approver: "Neha Kulkarni", status: "approved" },
    ]
  },
  {
    id: 5,
    employee: "Riya Desai",
    category: "Other",
    amount: 2500,
    currency: "INR",
    displayAmount: 2500 * RATES_TO_INR["INR"],
    date: "2025-03-23",
    description: "Postage and Courier",
    receipt: true,
    receiptFile: null,
    comments: "",
    status: deriveStatus([
      { role: "Manager", approver: "Sanjay Rao", status: "pending" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]),
    approvalSteps: [
      { role: "Manager", approver: "Sanjay Rao", status: "pending" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]
  },
  {
    id: 6,
    employee: "Arjun Mehta",
    category: "Software",
    amount: 120,
    currency: "EUR",
    displayAmount: 120 * RATES_TO_INR["EUR"],
    date: "2025-03-24",
    description: "JetBrains IDE License",
    receipt: true,
    receiptFile: null,
    comments: "",
    status: deriveStatus([
      { role: "Manager", approver: "Sanjay Rao", status: "approved" },
      { role: "Finance", approver: "Neha Kulkarni", status: "approved" },
    ]),
    approvalSteps: [
      { role: "Manager", approver: "Sanjay Rao", status: "approved" },
      { role: "Finance", approver: "Neha Kulkarni", status: "approved" },
    ]
  },
  {
    id: 7,
    employee: "Priya Sharma",
    category: "Travel",
    amount: 150,
    currency: "USD",
    displayAmount: 150 * RATES_TO_INR["USD"],
    date: "2025-03-25",
    description: "Uber rides NYC",
    receipt: true,
    receiptFile: null,
    comments: "",
    status: deriveStatus([
      { role: "Manager", approver: "Sanjay Rao", status: "pending" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]),
    approvalSteps: [
      { role: "Manager", approver: "Sanjay Rao", status: "pending" },
      { role: "Finance", approver: "Neha Kulkarni", status: "pending" },
    ]
  }
];

export const SEEDED_RULES = [
  { id: 1, name: "Auto-approve small", type: "percentage", value: "80% approve → auto-approve", active: true },
  { id: 2, name: "Exec Override", type: "specific", value: "CFO must approve", active: true },
  { id: 3, name: "Hybrid fallback", type: "hybrid", value: "80% OR CFO", active: false }
];
