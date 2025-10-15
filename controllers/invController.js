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
    const classificationSelect = await utilities.buildClassificationList() 
    const messages = req.flash("notice") || []

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON(req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData.length > 0) {
      return res.json(invData)
    } else {
      return res.json([])
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
async function buildEditInventory(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    if (!itemData) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/inv")
    }
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      messages: Array.isArray(req.flash("notice")) ? req.flash("notice") : [],
      ...itemData
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body

    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    if (updateResult) {
      const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        messages: Array.isArray(req.flash("notice")) ? req.flash("notice") : [],
        inv_id,
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
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build delete inventory confirmation view
 * ************************** */
async function buildDeleteInventory(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)

    if (!itemData) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/inv")
    }

    res.render("inventory/delete-confirm", {
      title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
      nav,
      errors: null,
      messages: Array.isArray(req.flash("notice")) ? req.flash("notice") : [],
      ...itemData
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process vehicle deletion
 * ************************** */
async function deleteInventory(req, res, next) {
  try {
    const { inv_id } = req.body
    const result = await invModel.deleteInventory(inv_id)

    if (result) {
      req.flash("notice", "Vehicle deleted successfully.")
    } else {
      req.flash("notice", "Vehicle deletion failed.")
    }

    res.redirect("/inv")
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
  getInventoryJSON,
  buildEditInventory,
  updateInventory,
  buildDeleteInventory,
  deleteInventory
}
