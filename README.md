
# 🛍️ Ecommerce-App

An end-to-end eCommerce web application featuring a secure REST API backend with authentication, Stripe-based payments, and a modern React frontend.

---

## 📁 Project Structure

```
Ecommerce-App/
│
├── backend/        # Express.js server with PostgreSQL and Passport.js
├── frontend/       # React.js client with Stripe integration
└── README.md       # You're here!
```

---

## 🔧 Backend (Node.js + Express)

### Features

- RESTful API using Express
- User authentication with Passport (Local, Google, GitHub)
- Secure sessions with `express-session`
- PostgreSQL database support via `pg`
- Cloudinary integration for image uploads
- Swagger API documentation
- Stripe payments for checkout
- Environment-based configuration using dotenv

### Technologies

- **Express** for server logic
- **Passport** for authentication strategies
- **Stripe** for payments
- **Cloudinary** + **Multer** for image uploads
- **Swagger** for API documentation
- **PostgreSQL** as database
- **Helmet** and **Rate Limiting** for security
- **Morgan** for logging

### Folder Structure

```
backend/
├── app.js                       # App entry point
├── config/                      # Passport config
├── controllers/                 # Route controllers
├── routes/                      # Express routes
├── swagger/                     # Swagger spec
├── .env.example                 # Environment variable template
├── package.json
```

### Setup Instructions

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**

   Copy `.env.example` to `.env` and fill in the appropriate values:

   ```env
   DATABASE_URL=your_postgres_connection_string
   SESSION_SECRET=your_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   STRIPE_SECRET_KEY=your_stripe_key
   ```

3. **Run the server:**

   ```bash
   npm run dev
   ```

4. **API Docs:**  
   Swagger UI is available at `http://localhost:5000/api-docs`

---

## 💻 Frontend (React.js)

### Features

- Fully responsive SPA with React
- Stripe Checkout integration
- React Router for navigation
- Icon library via `react-icons`
- Proxy to backend for API calls

### Technologies

- **React 19**
- **React Router DOM**
- **Stripe JS** and `@stripe/react-stripe-js`
- **React Icons**
- **React Scripts** for project bootstrapping

### Folder Structure

```
frontend/
├── src/
│   ├── components/           # Reusable components
│   ├── pages/                # Page views (Home, Product, Cart, etc.)
│   └── App.js                # Routing setup
├── .env
├── package.json
```

### Setup Instructions

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Run the app:**

   ```bash
   npm start
   ```

   The app will run at `http://localhost:3000` and proxy API calls to the backend (`localhost:5000`).

---

## 🔐 Authentication

- Supports Local, Google, and GitHub login via Passport.js.
- Secure session management with cookies.
- Login required for checkout and profile features.

---

## 💳 Payments

- Powered by **Stripe**.
- Secure checkout session created from the backend.
- React client uses `@stripe/react-stripe-js` for frontend interaction.

---

## 📦 Deployment Notes

- Use reverse proxy (e.g., NGINX) to serve both frontend and backend under the same domain.
- Set proper CORS and session cookie settings for production (`secure`, `sameSite`, etc.).
- Store secrets securely using a secrets manager or environment configuration in your cloud provider.

---

## 🧪 Testing

- Frontend tests using `@testing-library/react`
- Backend supports standard REST testing tools (e.g., Postman, Insomnia)
- Swagger UI available for API testing

---

## 📄 License

This project is licensed under the ISC license.
