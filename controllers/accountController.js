const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 * Deliver login view
 *****************************************/
async function buildLogin(req, res, next) {
  // If already logged in, redirect to home
  if (req.session && req.session.loggedin) {
    return res.redirect("/")
  }

  const nav = await utilities.getNav()
  const messages = req.flash("notice") || []
  res.render("account/login", {
    title: "Login",
    nav,
    messages: Array.isArray(messages) ? messages : [messages],
  })
}

/* ****************************************
 * Deliver registration view
 *****************************************/
async function buildRegister(req, res, next) {
  const nav = await utilities.getNav()
  const messages = req.flash("notice") || []
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    messages: Array.isArray(messages) ? messages : [messages],
  })
}

/* ****************************************
 * Process registration
 *****************************************/
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    console.error("Error hashing password:", error)
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/register", { title: "Registration", nav, errors: null })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash("notice", `Congratulations, ${account_firstname}, you're registered. Please log in.`)
    return res.status(201).render("account/login", { title: "Login", nav })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(501).render("account/register", { title: "Registration", nav })
  }
}

/* ****************************************
 * Process login request
 *****************************************/
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        account_email,
        messages: req.flash("notice"),
      })
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        account_email,
        messages: req.flash("notice"),
      })
    }

    // Remove sensitive info
    delete accountData.account_password

    // Store login info in session
    req.session.loggedin = true
    req.session.accountData = accountData

    // Explicitly save session before redirect
    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err)
        req.flash("notice", "Login failed due to session error.")
        return res.status(500).render("account/login", {
          title: "Login",
          nav,
          account_email,
          messages: req.flash("notice"),
        })
      }

      // Create JWT token
      const tokenPayload = {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type,
      }
      const token = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" })

      // Set JWT cookie
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 2 * 60 * 60 * 1000,
      })

      // Make session data available globally to templates
      res.locals.loggedin = true
      res.locals.accountData = accountData

      // Redirect to home page
      return res.redirect("/")
    })
  } catch (error) {
    console.error("Login error:", error)
    req.flash("notice", "Login failed due to server error.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      account_email,
      messages: req.flash("notice"),
    })
  }
}

/* ****************************************
 * Account management view
 *****************************************/
async function buildManagement(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountData = res.locals.accountData || (req.session && req.session.accountData) || null
    if (!accountData) {
      req.flash("notice", "Please log in.")
      return res.redirect("/account/login")
    }

    const isAdminOrEmployee = accountData.account_type === "Employee" || accountData.account_type === "Admin"

    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData,
      isAdminOrEmployee,
      messages: Array.isArray(req.flash("notice")) ? req.flash("notice") : [],
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Deliver account update view
 *****************************************/
async function buildAccountUpdate(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const account_id = req.params.account_id
      ? parseInt(req.params.account_id)
      : (req.session.accountData && req.session.accountData.account_id)
    if (!account_id) {
      req.flash("notice", "Unable to locate account.")
      return res.redirect("/account/")
    }

    const account = await accountModel.getAccountById(account_id)
    if (!account) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }

    res.render("account/account-update", {
      title: "Update Account",
      nav,
      account,
      errors: null,
      messages: Array.isArray(req.flash("notice")) ? req.flash("notice") : [],
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Process account info update
 *****************************************/
async function updateAccount(req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    if (!account_firstname || !account_lastname || !account_email) {
      req.flash("notice", "Please provide first name, last name and a valid email.")
      return buildAccountUpdate(req, res, next)
    }

    const existing = await accountModel.getAccountByEmail(account_email)
    if (existing && existing.account_id !== parseInt(account_id)) {
      req.flash("notice", "That email is already in use.")
      return buildAccountUpdate(req, res, next)
    }

    const updateResult = await accountModel.updateAccount(
      parseInt(account_id),
      account_firstname,
      account_lastname,
      account_email
    )
    if (updateResult) {
      const updatedAccount = await accountModel.getAccountById(parseInt(account_id))
      if (req.session) req.session.accountData = updatedAccount

      const tokenPayload = {
        account_id: updatedAccount.account_id,
        account_firstname: updatedAccount.account_firstname,
        account_lastname: updatedAccount.account_lastname,
        account_email: updatedAccount.account_email,
        account_type: updatedAccount.account_type,
      }
      const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" })
      res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 2 * 60 * 60 * 1000 })

      req.flash("notice", "Account information updated.")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Failed to update account.")
      return buildAccountUpdate(req, res, next)
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Process password change
 *****************************************/
async function changePassword(req, res, next) {
  try {
    const { account_id, newPassword } = req.body
    if (!newPassword || newPassword.length < 8) {
      req.flash("notice", "Password requirement not met. Please try again.")
      return buildAccountUpdate(req, res, next)
    }

    const hashedPassword = await bcrypt.hashSync(newPassword, 10)
    const result = await accountModel.updatePassword(parseInt(account_id), hashedPassword)
    if (result) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Failed to update password.")
      return buildAccountUpdate(req, res, next)
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Logout
 *****************************************/
async function logout(req, res, next) {
  try {
    res.clearCookie("jwt")
    if (req.session) {
      req.session.destroy(() => {
        return res.redirect("/")
      })
    } else {
      return res.redirect("/")
    }
  } catch (error) {
    next(error)
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  buildAccountUpdate,
  updateAccount,
  changePassword,
  logout,
}
