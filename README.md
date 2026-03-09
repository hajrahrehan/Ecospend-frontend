# Ecospend Frontend

A modern digital banking frontend built using React.js, designed to provide a seamless, secure, and intuitive banking experience. This repository contains the complete frontend codebase for the HelloBank.com application.

## Team Members

Section 8C – Web Programming

Name Roll No
Hajrah Rehan 22L-6810        
M Salman Amir 22L-6830

## Overview

This frontend interacts with the backend (Node.js + MongoDB) to deliver features such as:

- Account creation & authentication
- Balance and transaction management
- Beneficiary handling
- Card management
- Admin dashboard for account & ticket control
- Purchase of discounted products
- Full ticketing and support system

## Tech Stack

### Frontend

- React.js
- React Router
- Context API
- SCSS (Black Dashboard Theme)
- Custom UI Components
- ApiManager Helper Layer

### Backend (External)

- Node.js
- MongoDB

---

## 📁 Project Structure

```bash
.
│
├── public/                # Static assets + main HTML template
│   ├── apple-icon.png
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
│
├── src/
│   ├── assets/            # Images, CSS, SCSS, fonts
│   ├── components/        # All reusable UI & functional components
│   ├── contexts/          # Theme & color contexts
│   ├── helpers/           # ApiManager.tsx + utility functions
│   ├── layouts/           # Protected and unprotected layouts
│   ├── views/             # Page-level views (user + admin)
│   ├── index.js           # App entry point
│   └── routes.js          # Entry route configuration
│
├── package.json
├── jsconfig.json
└── README.md
```

## Core Functionalities Implemented

### Client Features

1. Create account
2. Login
3. View account details
4. View balance
5. Manage beneficiaries (Add, Edit, Delete)
6. Make transactions
7. View statements
8. Update profile
9. View issued cards
10. Buy discounted products
11. Create support tickets

### Admin Features

1. Issue cards
2. Block client cards
3. Close client accounts
4. Respond to tickets
5. View and manage all users

---

## Installation & Setup

```bash
git clone https://github.com/yourusername/hellobank-frontend.git
cd hellobank-frontend

2. Install Dependencies

npm install

3. Start the Development Server

npm start

App will run at:

http://localhost:3000


⸻
```
