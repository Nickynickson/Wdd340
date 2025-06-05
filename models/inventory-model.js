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

/* ***************************
 *  Insert new classification
 * ************************** */
async function insertClassification(classificationName) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id`;
    const result = await pool.query(sql, [classificationName]);
    return result.rows[0];
  } catch (error) {
    console.error("insertClassification error: " + error);
    throw error;
  }
}

/* ***************************
 *  Insert new inventory item
 * ************************** */
async function insertInventory(inventoryData) {
  try {
    const sql = `
      INSERT INTO public.inventory (
       
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING inv_id
    `;
    const params = [
      inventoryData.inv_make,
      inventoryData.inv_model,
      inventoryData.inv_year,
      inventoryData.inv_description,
      inventoryData.inv_image,
      inventoryData.inv_thumbnail,
      inventoryData.inv_price,
      inventoryData.inv_miles,
      inventoryData.inv_color,
      inventoryData.classification_id,
    ];
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error("insertInventory error: " + error);
    console.error("Inventory data: " + JSON.stringify(inventoryData));
    console.error(error.stack);
    throw error;
  }
}



const invModel = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  insertClassification,
  insertInventory
};

module.exports = invModel;