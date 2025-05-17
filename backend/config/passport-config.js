const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const pool = require('../database/db');
const { verifyPassword } = require('../middleware/hash');

function initialize(passport) {
  // Local Strategy
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, async (email, password, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        console.log('User not found');
        return done(null, false, { message: 'No user with that email' });
      }

      const match = await verifyPassword(password, user.password);
      if (!match) {
        console.log('Password mismatch');
        return done(null, false, { message: 'Password incorrect' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user = result.rows[0];

      if (!user) {
        const insert = await pool.query(
          'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
          [email, profile.displayName]
        );
        user = insert.rows[0];
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // GitHub OAuth Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback",
    scope: [ 'user:email' ]
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let email = null;
      
      if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
      } else {
        email = `${profile.username}@github.local`; // fallback (won't be a real email)
      }

      let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user = result.rows[0];

      if (!user) {
        const insert = await pool.query(
          'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
          [email, profile.displayName || profile.username]
        );
        user = insert.rows[0];
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Session handling
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return done(null, result.rows[0]);
    } catch (err) {
      return done(err);
    }
  });
}

module.exports = initialize;

