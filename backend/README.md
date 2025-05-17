# 💼 Backend E-Commerce API

A full-featured e-commerce REST API built using **Node.js**, **Express**, and **PostgreSQL**. Users can register, log in, browse products, manage carts, and place orders. Includes full Swagger API documentation.

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Endpoints](#endpoints)
- [License](#license)

---

## ✨ Features

- ✅ User registration & login (JWT & session-based)
- ✅ Browse and manage products
- ✅ Add/remove items from carts
- ✅ Checkout & order creation
- ✅ Protected routes using Passport.js
- ✅ Swagger API docs (`/api-docs`)
- ✅ PostgreSQL integration with parameterized queries
- ✅ Environment variable support with `.env`

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, Passport.js
- **Docs**: Swagger (via `swagger-jsdoc` and `swagger-ui-express`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ v14
- PostgreSQL ≥ v12

### Installation

```bash
git clone https://github.com/Damo89/Backend-Ecommerce-API.git
cd Backend-Ecommerce-API
npm install
```

### Configuration

Create a `.env` file in the root:

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SESSION_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret
```

### Run the Server

```bash
npm start
```

Server runs on: `http://localhost:3000`

---

## 📘 API Documentation

Swagger UI available at:  
👉 `http://localhost:3000/api-docs`

---

## 🗂 Project Structure

```
.
├── app.js                # Main entry point
├── controllers/          # Route logic (auth, products, carts, orders)
├── routes/               # Express route handlers
├── database/             # PostgreSQL pool connection
├── config/               # Passport config
├── swagger/              # Swagger setup and YAML definition
├── middleware/           # Custom middlewares (auth)
└── utils/                # Utility functions
```

---

## 🛒 Core Endpoints

| Method | Route                            | Description                  |
|--------|----------------------------------|------------------------------|
| POST   | `/api/auth/register`             | Register a new user          |
| POST   | `/api/auth/login`                | Log in a user                |
| GET    | `/api/products`                  | List all products            |
| POST   | `/api/carts/:userId/add`         | Add product to cart          |
| GET    | `/api/carts/:userId`             | Get user's cart              |
| POST   | `/api/checkout/:userId/checkout` | Checkout and create order    |
| GET    | `/api/orders/:userId`            | List user orders             |

🧪 Also includes a `/api/test/protected` route for verifying auth.

---

## 🗃 Database Schema (Key Tables)

- `users`: stores user credentials and roles
- `products`: stores product listings
- `carts`: maps user to products and quantities
- `orders`: tracks orders placed by users

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Contributing

Pull requests welcome! For major changes, open an issue first to discuss what you’d like to change.

---

