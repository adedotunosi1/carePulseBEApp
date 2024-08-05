const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require('./dbConnect');
const cors = require('cors');
const pulseRouter = require("./src/routes");
const { serverRequests } = require("./src/middlewares/server.middleware");
const { routeError, errorHandler } = require('./src/middlewares/error.middleware');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const { makeUsers } = require("./src/middlewares/user.middleware");
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = 'https://carepulsebeapp.onrender.com/oauth2callback';

const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
});

console.log('authUrl:', authUrl);

// Database connection
dbConnect();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = ["https://carepulse-gray.vercel.app", "http://localhost:4000"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
  ],
});

app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());
app.use(makeUsers);

app.get('/auth', (req, res) => {
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
     console.log(tokens);
    
     process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
     process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
 
     // Log tokens to verify they are received correctly
     console.log('Access Token:', tokens.access_token);
     console.log('Refresh Token:', tokens.refresh_token);

      // Check if refresh token is missing
      if (!tokens.refresh_token) {
        console.log('No refresh token found. Ensure access_type=offline is set and revoke previous access.');
      }

    res.send('Authentication successful! You can close this window.');
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    res.status(500).send('Error retrieving tokens');
  }
});

app.use("/api/v1/", pulseRouter);
app.use("/api/v1", (req, res, next) => {
  res.send({ msg: `Yes!... Welcome to Care Pulse API` });
  next();
});
// Middleware to set credentials for future requests
app.use((req, res, next) => {
  oAuth2Client.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  next();
});
app.use(serverRequests);
app.get("/", (req, res, next) => {
  res.send(`
    <h2> CarePulse Server </h2>
  `);
  next();
});

app.use(routeError);
app.use(errorHandler);

module.exports = app;
