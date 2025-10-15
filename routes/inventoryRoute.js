/********************************************
 * Inventory Routes
 ********************************************/

// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-Validation")

// ============================
// Inventory Routes
// ============================

// Management View (requires login)
router.get(
  "/", 
  utilities.checkLogin, 
  utilities.handleErrors(invController.buildManagementView)
)

// ============================
// Employee/Admin Routes
// ============================

// Add Classification
router.get(
  "/add-classification", 
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification", 
  utilities.checkAdmin,
  utilities.handleErrors(invController.addClassification)
)

// Add Inventory
router.get(
  "/add-inventory", 
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  utilities.checkAdmin,
  invValidate.newInventoryRules(),   // Validation rules
  invValidate.checkInventoryData,    // Validation check
  utilities.handleErrors(invController.addInventory)
)

// Edit Inventory
router.get(
  "/edit/:inv_id",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildEditInventory)
)

router.post(
  "/update",
  utilities.checkAdmin,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Delete Inventory - Confirmation View
router.get(
  "/delete/:inv_id",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildDeleteInventory)
)

// Delete Inventory - Process Delete
router.post(
  "/delete",
  utilities.checkAdmin,
  utilities.handleErrors(invController.deleteInventory)
)

// ============================
// Public Routes
// ============================

// Inventory by Classification
router.get(
  "/type/:classificationId", 
  utilities.handleErrors(invController.buildByClassificationId)
)

// Vehicle Detail View
router.get(
  "/detail/:invId", 
  utilities.handleErrors(invController.buildByInvId)
)

// Return Inventory by Classification (JSON Endpoint)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

module.exports = router
