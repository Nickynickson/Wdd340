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

/* ***************************
 *  Update inventory item
 * ************************** */
async function updateInventory(inventoryData) {
  try {
    const sql = `
      UPDATE public.inventory SET 
        inv_make = $1, 
        inv_model = $2, 
        inv_year = $3, 
        inv_description = $4, 
        inv_image = $5, 
        inv_thumbnail = $6, 
        inv_price = $7, 
        inv_miles = $8, 
        inv_color = $9, 
        classification_id = $10 
      WHERE inv_id = $11 
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
      inventoryData.inv_id,
    ];
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error("updateInventory error: " + error);
    console.error("Inventory data: " + JSON.stringify(inventoryData));
    console.error(error.stack);
    throw error;
  }
}


/* ***************************
 *  Delete inventory item
 *  This function deletes an inventory record from the database
 *  using the provided inventory ID (inv_id).
 *
 *  @param {number} inv_id - The ID of the inventory record to delete.
 *  @returns {object} - The deleted inventory id as confirmation.
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    // SQL command to delete the inventory record and return the deleted inv_id for verification
    const sql = "DELETE FROM inventory WHERE inv_id = $1 RETURNING inv_id";
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0];
  } catch (error) {
    console.error("deleteInventory error:", error);
    throw error;
  }
}


//Group all functions
const invModel = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  insertClassification,
  insertInventory,
  updateInventory,
  deleteInventory
};

module.exports = invModel;