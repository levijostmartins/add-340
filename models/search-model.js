const pool = require("../database/")

/* ***************************
 * Search inventory by criteria
 * criteria = { make, model, minPrice, maxPrice }
 *************************** */
async function searchInventory(criteria) {
  let baseQuery = `SELECT * FROM public.inventory WHERE 1=1`
  const params = []
  let count = 1

  if (criteria.make) {
    baseQuery += ` AND inv_make ILIKE $${count}`
    params.push(`%${criteria.make}%`)
    count++
  }

  if (criteria.model) {
    baseQuery += ` AND inv_model ILIKE $${count}`
    params.push(`%${criteria.model}%`)
    count++
  }

  if (criteria.minPrice) {
    baseQuery += ` AND inv_price >= $${count}`
    params.push(criteria.minPrice)
    count++
  }

  if (criteria.maxPrice) {
    baseQuery += ` AND inv_price <= $${count}`
    params.push(criteria.maxPrice)
    count++
  }

  baseQuery += ` ORDER BY inv_make, inv_model ASC`

  try {
    const result = await pool.query(baseQuery, params)
    return result.rows
  } catch (error) {
    console.error("searchInventory error:", error)
    throw error
  }
}

module.exports = { searchInventory }
