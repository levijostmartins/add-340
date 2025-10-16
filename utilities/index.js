const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    const classifications = await invModel.getClassifications(); // already an array

    let list = '<ul class="nav-list">';
    list += '<li><a href="/" title="Home page">Home</a></li>';

    // Add classification links dynamically
    if (Array.isArray(classifications) && classifications.length > 0) {
      classifications.forEach((row) => {
        list += `<li>
          <a href="/inv/type/${row.classification_id}" 
             title="See our inventory of ${row.classification_name} vehicles">
            ${row.classification_name}
          </a>
        </li>`;
      });
    }

    // Add additional links
    list += `<li><a href="/search" title="Search inventory">Search</a></li>`;
    list += `<li><a href="/admin/reports" title="View Admin Reports">Reports</a></li>`;

    list += '</ul>';
    return list;
  } catch (error) {
    console.error("getNav error:", error);
    return '<ul><li><a href="/">Home</a></li></ul>';
  }
};



/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  if (!data || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  let grid = '<ul id="inv-display">'
  data.forEach((vehicle) => {
    grid += `
      <li>
        <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>
    `
  })
  grid += "</ul>"
  return grid
}

/* **************************************
 * Formatting helpers
 * ************************************ */
function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function formatMileage(value) {
  return new Intl.NumberFormat("en-US").format(value)
}

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildVehicleDetailHTML = function (vehicle) {
  return `
    <section class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-info">
        <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Year:</strong> ${vehicle.inv_year}</p>
        <p><strong>Price:</strong> ${formatPrice(vehicle.inv_price)}</p>
        <p><strong>Mileage:</strong> ${formatMileage(vehicle.inv_miles)} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </section>
  `
}

/* **************************************
 * Build Classification <select> Element
 * Used in Add Inventory Form
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let list = '<select name="classification_id" id="classificationList" required>'
  list += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}"`
    if (classification_id != null && row.classification_id == classification_id) {
      list += " selected"
    }
    list += `>${row.classification_name}</option>`
  })

  list += "</select>"
  return list
}

/* ****************************************
 * Check JWT Token Middleware
 * - Reads jwt cookie
 * - Verifies and populates res.locals.accountData and req.session
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (!err && accountData) {
        // Populate session if missing
        if (req.session && !req.session.accountData) {
          req.session.loggedin = true
          req.session.accountData = accountData
        }
        res.locals.accountData = accountData
        res.locals.loggedin = true
      }
      return next()
    })
  } else if (req.session && req.session.accountData) {
    res.locals.accountData = req.session.accountData
    res.locals.loggedin = true
    next()
  } else {
    res.locals.loggedin = false
    res.locals.accountData = null
    next()
  }
}

/* ****************************************
 * Check Login Middleware
 * - Protects routes for logged-in users only
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (req.session && req.session.loggedin) {
    res.locals.loggedin = true
    res.locals.accountData = req.session.accountData
    return next()
  }
  req.flash("notice", "Please log in.")
  return res.redirect("/account/login")
}

/* ****************************************
 * Check Admin / Employee Middleware
 * - Protects add/edit/delete inventory routes
 **************************************** */
Util.checkAdmin = (req, res, next) => {
  const acct = req.session && req.session.accountData
  if (acct && (acct.account_type === "Employee" || acct.account_type === "Admin")) {
    res.locals.loggedin = true
    res.locals.accountData = acct
    return next()
  }
  req.flash("notice", "You must be an Employee or Admin to access that page.")
  return res.redirect("/account/login")
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
