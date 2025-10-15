/* *********************************************
 * Account Registration & Login Data Validation
 *********************************************/

// Require dependencies
const utilities = require(".") 
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")

// Create the validate object
const validate = {}

/* **********************************
 * Registration Data Validation Rules
 ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.")
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 12 characters, include 1 uppercase letter, 1 number, and 1 special character."
      ),
  ]
}

/* ******************************
 * Check registration data
 ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/register", {
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      errors: errors.array(),
      messages: req.flash("notice"),
    })
  }
  next()
}

/* **********************************
 * Login Data Validation Rules
 ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * Check login data
 ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/login", {
      title: "Login",
      nav,
      account_email,
      errors: errors.array(),
      messages: req.flash("notice"),
    })
  }
  next()
}

/* ****************************************
 * Middleware to check JWT token
 **************************************** */
validate.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        req.flash("notice", "Please log in")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
      }

      // Update session and locals
      if (req.session) {
        req.session.loggedin = true
        req.session.accountData = accountData
      }
      res.locals.loggedin = true
      res.locals.accountData = accountData
      next()
    })
  } else {
    res.locals.loggedin = req.session && req.session.loggedin ? true : false
    res.locals.accountData = req.session && req.session.accountData ? req.session.accountData : null
    next()
  }
}

module.exports = validate
