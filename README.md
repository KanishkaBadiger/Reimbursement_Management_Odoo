# Reimbursement Management System

### Odoo x VIT Pune Hackathon '26 Submission

An automated, full-stack expense reimbursement platform designed to eliminate manual bottlenecks. This application features dynamic multi-level approval workflows, automatic currency conversion, and role-based dashboards to streamline company expenses from submission to payout.

## Core Features

- **Smart Authentication & Setup:** Auto-creates company profiles upon signup and automatically sets the default company currency based on the selected country using the REST Countries API.
- **Role-Based Access Control (RBAC):** Distinct permissions and views for Admins, Managers, and Employees.
- **Dynamic Approval Routing:** Supports complex, multi-tiered approval logic including sequential routing, percentage-based approvals, and specific executive overrides.
- **Multi-Currency Support:** Employees can submit expenses in local currencies, which are automatically converted to the company's base currency for managerial review using real-time exchange rates.
- **AI-Powered OCR:** Smart receipt scanning that automatically extracts the expense amount, date, category, and merchant name.

## Tech Stack

- **Frontend:** React.js (Vite), React Router, Axios
- **Backend:** Python 
- **External APIs:** REST Countries API, ExchangeRate-API

## Local Setup Instructions

Follow these steps to run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/KanishkaBadiger/Reimbursement_Management_Odoo.git](https://github.com/KanishkaBadiger/Reimbursement_Management_Odoo.git)
cd Reimbursement_Management_Odoo


#Frontend Setup (React)
cd frontend
npm install
npm run dev

#Backend Setup (Python)
cd backend
python -m venv venv

# Activate the virtual environment (Windows)
.\venv\Scripts\activate

# Activate the virtual environment (Mac/Linux)
source venv/bin/activate

# Install dependencies 
pip install -r requirements.txt
