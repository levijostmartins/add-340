// controllers/invController.js
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

/* ***************************
 *  Build inventory by classification view
 * ************************** */
async function buildByClassificationId(req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  }) 
}

/* ***************************
 *  Build individual vehicle detail view
 * ************************** */
async function buildByInvId(req, res, next) {
  try {
    const invId = parseInt(req.params.invId)
    const data = await invModel.getVehicleById(invId)

    if (!data) {
      return res.status(404).render("inventory/detail", {
        title: "Vehicle Not Found",
        nav: await utilities.getNav(),
        message: "Sorry, that vehicle could not be found.",
      })
    }

    const grid = utilities.buildVehicleDetailHTML(data)
    const name = `${data.inv_make} ${data.inv_model}`

    res.render("inventory/detail", {
      title: name,
      nav: await utilities.getNav(),
      grid,
      message: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build management view
 * ************************** */
async function buildManagementView(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const messages = req.flash("notice") || []
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: Array.isArray(messages) ? messages : [messages],
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build add-classification view
 * ************************** */
async function buildAddClassification(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const messages = req.flash("notice") || []
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      messages: Array.isArray(messages) ? messages : [messages],
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process add-classification form
 * ************************** */
async function addClassification(req, res, next) {
  try {
    const { classification_name } = req.body
    const nav = await utilities.getNav()

    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash("notice", `Classification "${classification_name}" added successfully.`)
      const updatedNav = await utilities.getNav()
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav: updatedNav,
        messages: req.flash("notice"),
      })
    } else {
      req.flash("notice", "Failed to add classification.")
      res.status(501).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        messages: req.flash("notice"),
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build add-inventory view
 * ************************** */
async function buildAddInventory(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    const messages = req.flash("notice") || []
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null,
      messages: Array.isArray(messages) ? messages : [messages],
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process add-inventory form
 * ************************** */
async function addInventory(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body

    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    )

    if (result) {
      req.flash("notice", `${inv_make} ${inv_model} added successfully.`)
      const updatedNav = await utilities.getNav()
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav: updatedNav,
        messages: req.flash("notice"),
      })
    } else {
      req.flash("notice", "Failed to add vehicle. Please try again.")
      res.status(501).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationSelect,
        messages: req.flash("notice"),
        errors: null,
      })
    }
  } catch (error) {
    next(error)
  }
}

module.exports = {
  buildByClassificationId,
  buildByInvId,
  buildManagementView,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
}
