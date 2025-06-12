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

invCont.buildInvManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/management.ejs", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationSelect,
    });
  } catch (error) {
    next(error);
  }
};

// Add New Classification
invCont.addClassification = async function (req, res, next) {
  try {
    const { classificationName } = req.body;
    // Insert new classification
    const result = await invModel.insertClassification(classificationName);
    // Get updated nav
    let nav = await utilities.getNav();

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        success: true,
        message: "Classification added successfully",
        nav: nav,
      });
    } else {
      req.flash("success", "Classification added successfully");
      res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
      });
    }
  } catch (error) {
    let nav = await utilities.getNav();
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res
        .status(500)
        .json({ success: false, message: "Error adding classification" });
    } else {
      req.flash("error", "Error adding classification");
      res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: [error.message],
      });
    }
  }
};

// Render the Add New Classification form
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
    });
  } catch (error) {
    next(error);
  }
};

// Render the Add New Inventory form
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classifications = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classifications,
      errors: [],
      stickyData: {},
    });
  } catch (error) {
    next(error);
  }
};

// Add New Inventory
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    // Validate classification_id exists
    if (!classification_id) {
      throw new Error("Classification is required");
    }

    const inventoryData = {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price: Math.round(parseFloat(inv_price)),
      inv_miles: parseInt(inv_miles, 10),
      inv_color,
      classification_id: parseInt(classification_id, 10),
    };

    // Log the data being sent to the database for debugging
    console.log("Sending to database:", inventoryData);
    const result = await invModel.insertInventory(inventoryData);
    let nav = await utilities.getNav();
    if (result) {
      console.log("Vehicle added successfully with ID:", result.inv_id);
      req.flash("success", "Vehicle added successfully");
      res.redirect("/inv");
    } else {
      req.flash("error", "Error adding vehicle");
      res.status(500).render("./inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classifications: await utilities.buildClassificationList(
          classification_id
        ),
        errors: [],
        stickyData: inventoryData,
      });
    }
  } catch (error) {
    let nav = await utilities.getNav();
    req.flash("error", "Error adding vehicle");
    res.status(500).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classifications: await utilities.buildClassificationList(
        req.body.classification_id
      ),
      errors: [{ msg: error.message }],
      stickyData: req.body,
    });
  }
};


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getVehicleById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    stickyData: {
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    },
  });
};


/* ***************************
 *  Update Inventory
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    // Validate classification_id exists
    if (!classification_id) {
      throw new Error("Classification is required");
    }

    const inventoryData = {
      inv_id: parseInt(inv_id),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price: Math.round(parseFloat(inv_price)),
      inv_miles: parseInt(inv_miles, 10),
      inv_color,
      classification_id: parseInt(classification_id, 10),
    };

    // Log the data being sent to the database for debugging
    console.log("Updating database with:", inventoryData);
    const updateResult = await invModel.updateInventory(inventoryData);

    if (updateResult) {
      req.flash("success", "Vehicle updated successfully");
      res.redirect("/inv");
    } else {
      req.flash("error", "Error updating vehicle");
      const itemName = `${inv_make} ${inv_model}`;
      let nav = await utilities.getNav();
      const classificationSelect = await utilities.buildClassificationList(
        classification_id
      );

      res.status(500).render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        stickyData: inventoryData,
      });
    }
  } catch (error) {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(
      req.body.classification_id
    );
    const itemName = `${req.body.inv_make} ${req.body.inv_model}`;

    req.flash("error", "Error updating vehicle");
    res.status(500).render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: [{ msg: error.message }],
      stickyData: req.body,
    });
  }
};

/* ***************************
 *  Render Delete Inventory View
 *  This function renders the delete confirmation page for a vehicle using its inv_id.
 *  It fetches the vehicle details and builds the navigation before rendering the view.
 * *************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  try {
    // Extract and validate the inventory ID from the URL parameters
    const inv_id = parseInt(req.params.inv_id, 10);
    if (isNaN(inv_id)) {
      return next(new Error("Invalid inventory id provided."));
    }

    // Retrieve vehicle details for confirmation
    const vehicleData = await invModel.getVehicleById(inv_id);
    if (!vehicleData) {
      return res.status(404).render("./errors/error", {
        title: "Vehicle Not Found",
        message: "No vehicle found for deletion.",
        nav: await utilities.getNav(),
      });
    }

    // Build navigation
    const nav = await utilities.getNav();

    // Render the delete confirmation view with read-only details
    res.render("./inventory/delete-inventory", {
      title: `Delete ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      errors: null,
      stickyData: vehicleData,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Delete Inventory Item
 *  This function processes the deletion of a vehicle record after confirmation.
 *  It validates the inventory ID from the request body, calls the model's deleteInventory function,
 *  and handles success and error responses accordingly.
 * *************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    // Parse and validate the inventory ID from the request body
    const inv_id = parseInt(req.body.inv_id, 10);
    if (isNaN(inv_id)) {
      req.flash("error", "Invalid inventory id provided.");
      return res.redirect("/inv");
    }

    // Attempt to delete the vehicle from the database
    const deleteResult = await invModel.deleteInventory(inv_id);

    if (deleteResult) {
      // Successful deletion; flash a success message and redirect to inventory management
      req.flash("success", "Vehicle deleted successfully.");
      return res.redirect("/inv");
    } else {
      // If deletion did not occur, flash an error and re-render the delete view
      req.flash("error", "Failed to delete vehicle. Please try again.");
      const nav = await utilities.getNav();
      const vehicleData = await invModel.getVehicleById(inv_id);
      return res.status(500).render("./inventory/delete-inventory", {
        title: `Delete ${vehicleData?.inv_make || ""} ${
          vehicleData?.inv_model || ""
        }`,
        nav,
        errors: [{ msg: "Vehicle could not be deleted." }],
        stickyData: vehicleData,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;