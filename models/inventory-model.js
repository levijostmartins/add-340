const pool = require("../database/")

/* ***************************
 *  Get all classifications
 *************************** */
async function getClassifications() {
  try {
    const sql = `SELECT classification_id, classification_name
                 FROM public.classification
                 ORDER BY classification_name ASC`
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getClassifications error: " + error)
    throw error
  }
}

/* ***************************
 *  Get all inventory items by classification_id
 *************************** */
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
 *************************** */
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
 *************************** */
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
 *************************** */
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
 *************************** */
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
 *************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = `DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *`
    const data = await pool.query(sql, [inv_id])
    return data.rowCount > 0
  } catch (error) {
    console.error("deleteInventory error: " + error)
    throw error
  }
}

/* ***************************
 *  Search Inventory with filters
 *************************** */
async function searchInventory(filters) {
  try {
    let sql = `SELECT * FROM public.inventory WHERE 1=1`
    const params = []

    if (filters.make) {
      params.push(`%${filters.make}%`)
      sql += ` AND LOWER(inv_make) LIKE LOWER($${params.length})`
    }

    if (filters.model) {
      params.push(`%${filters.model}%`)
      sql += ` AND LOWER(inv_model) LIKE LOWER($${params.length})`
    }

    if (filters.yearMin) {
      params.push(filters.yearMin)
      sql += ` AND inv_year >= $${params.length}`
    }

    if (filters.yearMax) {
      params.push(filters.yearMax)
      sql += ` AND inv_year <= $${params.length}`
    }

    if (filters.priceMin) {
      params.push(filters.priceMin)
      sql += ` AND inv_price >= $${params.length}`
    }

    if (filters.priceMax) {
      params.push(filters.priceMax)
      sql += ` AND inv_price <= $${params.length}`
    }

    sql += ` ORDER BY inv_make, inv_model`

    const data = await pool.query(sql, params)
    return data.rows
  } catch (error) {
    console.error("searchInventory error:", error)
    throw error
  }
}

/* ***************************
 *  Get all distinct makes and models
 *************************** */
async function getAllMakes() {
  try {
    const sql = `SELECT DISTINCT inv_make FROM public.inventory ORDER BY inv_make ASC`
    const result = await pool.query(sql)
    return result.rows.map(row => row.inv_make)
  } catch (error) {
    console.error("getAllMakes error:", error)
    throw error
  }
}

async function getAllModels() {
  try {
    const sql = `SELECT DISTINCT inv_model FROM public.inventory ORDER BY inv_model ASC`
    const result = await pool.query(sql)
    return result.rows.map(row => row.inv_model)
  } catch (error) {
    console.error("getAllModels error:", error)
    throw error
  }
}

/* ***************************
 *  Admin Report (Summary)
 *************************** */
async function getInventoryReport() {
  try {
    const sql = `
      SELECT c.classification_name,
             COUNT(i.inv_id) AS total_vehicles,
             ROUND(AVG(i.inv_price)) AS avg_price,
             ROUND(AVG(i.inv_miles)) AS avg_miles
      FROM public.classification c
      LEFT JOIN public.inventory i ON c.classification_id = i.classification_id
      GROUP BY c.classification_name
      ORDER BY c.classification_name ASC
    `
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getInventoryReport error:", error)
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
  deleteInventory,
  searchInventory,
  getInventoryReport,
  getAllMakes,
  getAllModels
}
