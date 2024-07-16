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

dbConnect();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
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
app.use(bodyParser.urlencoded({ extended: false}));
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
app.use(makeUsers)
app.use("/api/v1/", pulseRouter);
app.use("/api/v1", (req, res, next) => {
  res.send({ msg: `Yes!... Welcome to Care Pulse API` });
  next();
});
app.use(serverRequests);
app.get("/", (req, res, next) => {
    res.send(`
    <h2> CarePulse Server </h2>
    `)
    next();
})

app.use(routeError);

app.use(errorHandler);


module.exports = app;