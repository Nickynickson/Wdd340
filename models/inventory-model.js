const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


/* ***************************
 *  Fetch vehicle details by ID
 * ************************** */
async function getVehicleById(vehicleId) {
  try {
    const query = "SELECT * FROM inventory WHERE inv_id = $1"; // Adjust based on your table schema
    const result = await pool.query(query, [vehicleId]);
    return result.rows[0]; // Return the first row of the result
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}


const invModel = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById
};



module.exports = invModel;