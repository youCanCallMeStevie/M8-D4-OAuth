const express = require("express");
const cors = require("cors");
const { join } = require("path");
const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const usersRouter = require("./services/users");
const oauth = require("./services/auth/oauth"); //import so that the google strategy can be used by passport, but it isn't called any where

const {
  notFoundHandler,
  forbiddenHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers");

const server = express();

const whitelist = ["http://localhost:3000"]; //whose allowed, which can be an array of strings
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, //credentials=cookies, and letting cors know that cookies are allowed
};

server.use(cors(corsOptions)); //if using cookies, you can't leave cors empty
const port = process.env.PORT;

const staticFolderPath = join(__dirname, "../public");
server.use(express.static(staticFolderPath));
server.use(express.json()); //this is a body parser
server.use(cookieParser()); //this is a cookie parser & cookies will be made avaialble & be able to read content of cookies
server.use(passport.initialize());

server.use("/users", usersRouter);

// ERROR HANDLERS MIDDLEWARES

server.use(badRequestHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

console.log(listEndpoints(server));

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port);
    })
  )
  .catch(err => console.log(err));
