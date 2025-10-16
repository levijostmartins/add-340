const reportsModel = require("../models/reports-model")
const utilities = require("../utilities")

// Public-safe reports dashboard
async function buildDashboard(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const data = await reportsModel.getSummary()

    // Render dashboard safely for public users
    res.render("reports/dashboard", {
      title: "Admin Reports Dashboard",
      nav,
      data,
      user: null,    // no session user
      errors: null,
    })
  } catch (error) {
    console.error("Reports error:", error)
    const nav = await utilities.getNav()
    res.render("reports/dashboard", {
      title: "Admin Reports Dashboard",
      nav,
      data: null,
      user: null,    // no session user
      errors: ["Error loading reports."],
    })
  }
}

module.exports = { buildDashboard }
