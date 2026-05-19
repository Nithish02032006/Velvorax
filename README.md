# Velvorax Full-Stack Platform

A high-performance business automation platform, CRM, and scaling solution.

## Features
- Complete Dark/Gold aesthetic UI with Glassmorphism
- Marketing Pages: Home, Features (Mermaid.js workflow), Services, Pricing
- Internal CRM Dashboard: Metrics, Charts, Leads Management, Employee Tracking, Calling, Invoices, Settings
- Secure Backend: Node.js + Express + MongoDB + JWT Authentication
- Responsive and Dynamic components

## Tech Stack
- Frontend: HTML5, Tailwind CSS, Vanilla JS, Chart.js, Mermaid.js
- Backend: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure MongoDB is running locally (or update `.env` with your MongoDB URI).
4. Run the seed script to populate the database with a demo admin account and sample data:
   ```bash
   node seed.js
   ```
5. Start the backend server:
   ```bash
   node server.js
   ```
   *The server will run on port 5000.*

### 2. Frontend Setup
1. Open the `frontend` folder.
2. Open `index.html` in your web browser. (You can also use Live Server in VS Code).
3. To access the CRM, go to the **Login** page and use the following seeded credentials:
   - **Email:** admin@velvorax.com
   - **Password:** Admin123

## Notes
- Ensure the backend server is running while testing the dashboard, as it fetches data via REST API.
