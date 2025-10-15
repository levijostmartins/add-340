const pool = require("../database/")

/* ***************************
 *  Get all classifications
 * ************************** */
async function getClassifications() {
  try {
    const sql = `SELECT classification_id, classification_name
                 FROM public.classification
                 ORDER BY classification_name ASC`
    const data = await pool.query(sql)
    return data
  } catch (error) {
    console.error("getClassifications error: " + error)
    throw error
  }
}

/* ***************************
 *  Get all inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const result = await pool.query(
      `SELECT * 
       FROM public.inventory 
       WHERE classification_id = $1 
       ORDER BY inv_make`,
      [classification_id]
    )
    return result.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error)
    throw error
  }
}

/* ***************************
 *  Get vehicle by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return result.rows[0]
  } catch (error) {
    console.error("getVehicleById error: " + error)
    throw error
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name)
                 VALUES ($1)
                 RETURNING *`
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    console.error("addClassification error: " + error)
    throw error
  }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(
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
) {
  try {
    const sql = `INSERT INTO public.inventory 
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`
    const data = await pool.query(sql, [
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
    ])
    return data.rows[0]
  } catch (error) {
    console.error("addInventory error: " + error)
    throw error
  }
}

/* ***************************
 *  Update existing inventory item
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql = `UPDATE public.inventory
                 SET inv_make = $1,
                     inv_model = $2,
                     inv_description = $3,
                     inv_image = $4,
                     inv_thumbnail = $5,
                     inv_price = $6,
                     inv_year = $7,
                     inv_miles = $8,
                     inv_color = $9,
                     classification_id = $10
                 WHERE inv_id = $11
                 RETURNING *`
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("updateInventory error: " + error)
    throw error
  }
}

/* ***************************
 *  Delete inventory item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = `DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *`
    const data = await pool.query(sql, [inv_id])
    return data.rowCount > 0 // return true if deleted
  } catch (error) {
    console.error("deleteInventory error: " + error)
    throw error
  }
}

module.exports = {
  getClassifications,          
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventory
}
