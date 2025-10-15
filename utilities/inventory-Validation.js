/* *********************************************
 *  Inventory Data Validation
 * *********************************************/

// Require dependencies
const utilities = require(".") // your utilities index.js
const { body, validationResult } = require("express-validator")

// Create validate object
const validate = {}

/* **********************************
 * Validation rules for adding/updating inventory
 * ********************************* */
validate.newInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle make."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle model."),

    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid year."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a vehicle description."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide a valid image path."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a valid thumbnail path."),

    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),

    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Please provide a valid mileage."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle color."),

    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Please select a valid classification."),
  ]
}

/* **********************************
 * Check inventory data for ADD
 * ********************************* */
validate.checkInventoryData = async (req, res, next) => {
  const {
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

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Inventory",
      nav,
      classificationSelect,
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
    })
    return
  }
  next()
}

/* **********************************
 * Check inventory data for UPDATE
 * ********************************* */
validate.checkUpdateData = async (req, res, next) => {
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

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
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
    })
    return
  }
  next()
}

module.exports = validate
