/********************************************
 * Account Routes
 ********************************************/

// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

/* ****************************************
 * Default route (Account Management View)
 * Requires user to be logged in
 *****************************************/
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
)

/* ****************************************
 * Login Page View
 *****************************************/
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

/* ****************************************
 * Registration Page View
 *****************************************/
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

/* ****************************************
 * Registration POST Route with Validation
 *****************************************/
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ****************************************
 * Login POST Route with Validation
 *****************************************/
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

/* ****************************************
 * Deliver account update form (GET)
 * Uses logged-in ID if none passed
 *****************************************/
router.get(
  "/update/:account_id?",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountUpdate)
)

/* ****************************************
 * Process Account Update (POST)
 * Optional: add validation middleware if needed
 *****************************************/
router.post(
  "/update",
  utilities.checkLogin,
  utilities.handleErrors(accountController.updateAccount)
)

/* ****************************************
 * Process Password Change (POST)
 * Optional: add password validation middleware if needed
 *****************************************/
router.post(
  "/password",
  utilities.checkLogin,
  utilities.handleErrors(accountController.changePassword)
)

/* ****************************************
 * Logout Route
 *****************************************/
router.get(
  "/logout",
  utilities.checkLogin, 
  utilities.handleErrors(accountController.logout)
)

module.exports = router
