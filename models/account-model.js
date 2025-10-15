const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account 
      (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *
    `
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    return result.rows[0]
  } catch (error) {
    console.error("Error registering account:", error)
    return false
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount > 0
  } catch (error) {
    console.error("Error checking email:", error)
    return false
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
      FROM account
      WHERE account_email = $1
    `
    const result = await pool.query(sql, [account_email])
    return result.rows[0]
  } catch (error) {
    console.error("Error fetching account by email:", error)
    return null
  }
}

/* *****************************
* Return account data using account_id
* ***************************** */
async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type
      FROM account
      WHERE account_id = $1
    `
    const result = await pool.query(sql, [account_id])
    return result.rows[0]
  } catch (error) {
    console.error("Error fetching account by ID:", error)
    return null
  }
}

/* *****************************
* Update account info (firstname, lastname, email)
* ***************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1,
          account_lastname = $2,
          account_email = $3
      WHERE account_id = $4
      RETURNING *
    `
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("Error updating account:", error)
    return false
  }
}

/* *****************************
* Update account password
* ***************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *
    `
    const result = await pool.query(sql, [hashedPassword, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("Error updating password:", error)
    return false
  }
}

module.exports = { 
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
}
