const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
}

/* ***************************
 *  Get specific vehicle detail view
 * ************************** */
invCont.getVehicleDetail = async function (req, res, next) {
  try {
    const vehicleId = req.params.id;
    const vehicleData = await invModel.getVehicleById(vehicleId);

    if (!vehicleData) {
      return res.status(404).render("./error", {
        title: "404 Error",
        message: "Vehicle not found.",
        nav: await utilities.getNav(),
      });
    }

    // Format price and mileage for display but keep original data intact
    vehicleData.formatted_price = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(vehicleData.inv_price);

    vehicleData.formatted_mileage = new Intl.NumberFormat("en-US").format(
      vehicleData.inv_miles
    );

    let nav = await utilities.getNav();

    res.render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicle: vehicleData, // Pass the raw vehicle data with added formatted fields
    });
  } catch (error) {
    next(error);
  }
};


module.exports = invCont;