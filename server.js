/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const session = require("express-session")
const flash = require("connect-flash")
const messages = require("express-messages")
const bodyParser = require("body-parser")
const path = require("path")

const app = express()

// Database and session store
const pool = require("./database/")
const pgSession = require("connect-pg-simple")(session)

// Controllers & routes
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const staticRoutes = require("./routes/static")
const errorRoutes = require("./routes/errorRoutes")
const utilities = require("./utilities/")

/* ***********************
 * Middleware
 *************************/

// Parse incoming request bodies
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Body parser (legacy compatibility)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Static routes
app.use(staticRoutes)

// Session management
app.use(
  session({
    store: new pgSession({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    name: "sessionId",
    cookie: { secure: false }, // set true if HTTPS
  })
)

// Flash messages middleware
app.use(flash())
app.use((req, res, next) => {
  res.locals.messages = messages(req, res)
  next()
})

/* ***********************
 * View engine and templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/

// Home page
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes (classification + details)
app.use("/inv", inventoryRoute)

// Account routes (login, registration, etc.)
app.use("/account", accountRoute)

// Error routes
app.use("/", errorRoutes)

// 404 handler (must come last)
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Global Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
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
})

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"


app.listen(port, () => {
  console.log(`App running at http://${host}:${port}`)
})
