const express = require('express');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./config/passport-config');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.set('trust proxy', 1); // Trust first proxy for X-Forwarded-For

// CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Rate limiter with custom key generator to avoid trust proxy issues
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown'
  }));
} else {
  console.log('Rate limiting disabled in development');
}

// Security + logging
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(session({
  name: 'connect.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in prod only
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Passport initialization
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
const testRoutes = require('./routes/test');
const ordersRoutes = require('./routes/orders');
const cartRoutes = require('./routes/carts');
const checkoutRoutes = require('./routes/checkout');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

app.use('/api', testRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
