// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// ============================
// Inventory Routes
// ============================

// Management view
router.get("/", invController.buildManagementView)

// Add Classification
router.get("/add-classification", invController.buildAddClassification)
router.post("/add-classification", invController.addClassification)

// Add Inventory
router.get("/add-inventory", invController.buildAddInventory)
router.post("/add-inventory", invController.addInventory)

// Inventory by Classification
router.get("/type/:classificationId", invController.buildByClassificationId)

// Vehicle Detail View
router.get("/detail/:invId", invController.buildByInvId)

module.exports = router
