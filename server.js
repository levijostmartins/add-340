/* ******************************************
 * server.js - Main application entry
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)
const flash = require("connect-flash")
const messages = require("express-messages")
const cookieParser = require("cookie-parser")
const path = require("path")

// Database pool
const pool = require("./database/")

// Controllers & routes
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const staticRoutes = require("./routes/static")
const errorRoutes = require("./routes/errorRoutes")
const utilities = require("./utilities/")

/* ***********************
 * App Initialization
 *************************/
const app = express()

/* ***********************
 * Middleware
 *************************/
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

/* ***********************
 * Session Management
 *************************/
app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
      pruneSessionInterval: 0,
    }),
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
)

/* ***********************
 * JWT Middleware
 * Apply after sessions are initialized
 *************************/
app.use(utilities.checkJWTToken)

/* ***********************
 * Make session info available to EJS views
 *************************/
app.use((req, res, next) => {
  res.locals.loggedin = req.session && req.session.loggedin ? true : false
  res.locals.accountData = req.session && req.session.accountData ? req.session.accountData : null
  next()
})

/* ***********************
 * Flash messages middleware
 *************************/
app.use(flash())
app.use((req, res, next) => {
  res.locals.messages = messages(req, res)
  next()
})

/* ***********************
 * Static files
 *************************/
app.use(express.static(path.join(__dirname, "public")))
app.use(staticRoutes)

/* ***********************
 * View engine
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)
app.use("/", errorRoutes)

/* ***********************
 * 404 handler
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  try {
    const nav = await utilities.getNav()
    console.error(`Error at "${req.originalUrl}": ${err.message}`)

    const status = err.status || 500
    const message =
      status === 404
        ? err.message
        : "Oh no! There was a crash. Maybe try a different route?"

    res.status(status).render("errors/error", {
      title: `${status} Error`,
      message,
      nav,
    })
  } catch (error) {
    console.error("Error rendering error page:", error)
    res.status(500).send("Server error")
  }
})

/* ***********************
 * Server Start
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`App running at http://${host}:${port}`)
})
