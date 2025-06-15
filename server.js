/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const expressLayout = require("express-ejs-layouts")
const express = require("express")
const env = require("dotenv").config()
const app = express()
const session = require("express-session")
const pool = require('./database/')
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute") // Account routes
const bodyParser = require("body-parser");
const invController = require("./controllers/invController");
const cookieParser = require("cookie-parser");
const utilities = require("./utilities/");
const authorizeEmployeeAdmin = require("./utilities/authorizeEmployeeAdmin");
const reviewRoutes = require("./routes/reviewRoute");
/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
    ttl: 86400, // Session expiration time in seconds (1 day)
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(utilities.checkJWTToken) // Middleware to check JWT token validity


// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Fallback middleware to ensure loggedin is always defined
app.use((req, res, next) => {
  if (typeof res.locals.loggedin === "undefined") {
    res.locals.loggedin = false;
  }
  next();
});
/* ***********************
 * View Engine and Template
 *************************/
app.set("view engine", "ejs")
app.use(expressLayout)
app.set("layout", "./layouts/layout")



/* ***********************
 * Routes
 *************************/
app.use(static)

//accountRoute
app.use("/account", accountRoute);
//index route
app.get("/", baseController.buildHome);
// Inventory routes
app.use("/inv", inventoryRoute);
// Account routes
app.use("/account", require("./routes/accountRoute"));
app.get("/inv", authorizeEmployeeAdmin, invController.buildInvManagement);
//Reviews Route
app.use("/reviews", reviewRoutes);
/* ***********************
 * Express Error Handling
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("error/error", {
    title: err.status || "Server Error",
    message:
      "Sorry, PAGE NOT fOUND",
    nav,
  });
});


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
