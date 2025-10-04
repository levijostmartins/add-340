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

async function buildByInvId(req, res, next) {
  try {
    const invId = parseInt(req.params.invId);
    const data = await invModel.getVehicleById(invId);

    if (!data) {
      return res.status(404).render("inventory/detail", {
        title: "Vehicle Not Found",
        message: "Sorry, that vehicle could not be found.",
      });
    }

    const grid = utilities.buildVehicleDetailHTML(data);
    const name = `${data.inv_make} ${data.inv_model}`;

    res.render("inventory/detail", {
      title: name,
      nav: await utilities.getNav(),
      grid,
      message: null,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildByClassificationId,
  buildByInvId,
}
