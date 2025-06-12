const pool = require("../database/");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

//Returning account data using email.
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error("No matching account found.");
  }
}

// Get account information by account_id
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error("No matching account found.");
  }
}

// Update account information
async function updateAccount(
  account_id,
  account_firstname,
  account_lastname,
  account_email
) {
  try {
    const sql =
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Account update failed.");
  }
}

// Update account password
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql =
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING account_password";
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Password update failed.");
  }
}

const accountModel = {
  registerAccount,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
};
module.exports = accountModel;
