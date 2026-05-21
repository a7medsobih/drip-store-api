# 🛍️ Drip Store API

A scalable and production-ready RESTful API for a full-featured e-commerce platform built with Node.js, Express, and MongoDB.

This project implements a modular architecture with clean separation of concerns and supports authentication, product management, cart system, orders, refunds, testimonials, and admin analytics.

## 🚀 Features

- 🔐 Authentication system (JWT-based)
- 👤 User profile & address management (default address support)
- 🏷️ Categories & Subcategories (admin CRUD + soft delete)
- 📦 Product management with image upload (Multer)
- 🔎 Advanced product filtering, sorting & pagination
- ⚡ Cached endpoints for Best Sellers & New Arrivals
- 🛒 Smart Cart system with price sync & guest cart merge
- 📑 Order management with stock handling using MongoDB transactions
- 🔄 Refund system with stock restoration on approval
- 💬 Testimonials system with approval workflow
- 📊 Admin reports dashboard (revenue, orders, units sold, top products)
- 🛡️ Role-based access control (User / Admin)
- ⚠️ Centralized error handling system
- 📧 Email service integration (Nodemailer)
- 📂 Clean modular folder structure

## 🧰 Tech Stack

```json
{
  "bcrypt": "^6.0.0",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.4.1",
  "multer": "^2.1.1",
  "node-cache": "^5.1.2",
  "nodemailer": "^6.10.1",
  "nodemon": "^3.1.14",
  "winston": "^3.19.0"
}
```

## 📁 Project Structure

```text
drip-store-api/
├─ server.js
├─ src/
│  ├─ app.js
│  ├─ config/
│  ├─ constants/
│  ├─ middlewares/
│  ├─ models/
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ user/
│  │  ├─ address/
│  │  ├─ category/
│  │  ├─ subcategory/
│  │  ├─ product/
│  │  ├─ cart/
│  │  ├─ order/
│  │  ├─ refund/
│  │  ├─ testimonial/
│  │  ├─ report/
│  ├─ services/
│  ├─ utils/
└─ uploads/
   └─ products/
```

## ⚙️ Installation

```bash
git clone https://github.com/your-repo/drip-store-api.git
cd drip-store-api
npm install
```

## ▶️ Running the Project

```bash
npm start
```

## 👨‍💻 Author

**Ahmed Sobih**

- Portfolio: [https://ahmedsobih-portfolio.vercel.app/](https://ahmedsobih-portfolio.vercel.app/)
- LinkedIn: [https://www.linkedin.com/in/ahmedsobih](https://www.linkedin.com/in/ahmedsobih)
