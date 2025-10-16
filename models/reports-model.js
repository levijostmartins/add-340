const pool = require("../database/")

async function getSummary() {
  const queries = {
    totalAccounts: `SELECT COUNT(*) FROM public.account`,
    totalVehicles: `SELECT COUNT(*) FROM public.inventory`,
    avgPrice: `SELECT AVG(inv_price) FROM public.inventory`,
    classifications: `SELECT c.classification_name, COUNT(i.inv_id) AS count
                      FROM public.classification c
                      LEFT JOIN public.inventory i ON c.classification_id = i.classification_id
                      GROUP BY c.classification_name
                      ORDER BY c.classification_name`,
  }

  try {
    const [accounts, vehicles, avg, classBreakdown] = await Promise.all([
      pool.query(queries.totalAccounts),
      pool.query(queries.totalVehicles),
      pool.query(queries.avgPrice),
      pool.query(queries.classifications),
    ])

    return {
      totalAccounts: accounts.rows[0].count,
      totalVehicles: vehicles.rows[0].count,
      avgPrice: parseFloat(avg.rows[0].avg || 0).toFixed(2),
      classifications: classBreakdown.rows,
    }
  } catch (error) {
    console.error("getSummary error:", error)
    throw error
  }
}

module.exports = { getSummary }
