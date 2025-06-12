// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const inventoryValidation = require("../utilities/inventory-validation");
const utilities = require("../utilities");
const authorizeEmployeeAdmin = require("../utilities/authorizeEmployeeAdmin");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:id", invController.getVehicleDetail);
router.get("/inv", authorizeEmployeeAdmin, invController.buildInvManagement);

// GET route to render the Add New Classification form
router.get(
  "/add-classification",
  authorizeEmployeeAdmin,
  invController.buildAddClassification
);

// Route to handle add-classification form submission
router.post(
  "/add-classification",
  authorizeEmployeeAdmin,
  inventoryValidation.classificationRules(),
  inventoryValidation.checkClassificationData,
  invController.addClassification
);

// Route to render Add New Inventory view
router.get(
  "/add-inventory",
  authorizeEmployeeAdmin,
  invController.buildAddInventory
);

// Route to handle add-inventory form submission
router.post(
  "/add-inventory",
  authorizeEmployeeAdmin,
  inventoryValidation.inventoryRules(),
  inventoryValidation.checkInventoryData,
  invController.addInventory
);

//Get inventory for AJAC Route
router.get(
  "/getInventory/:classification_id",
  utilities.handleError(invController.getInventoryJSON)
);

// Route to render Edit Inventory view
// This route matches '/inv/edit/:inv_id', where :inv_id is the inventory ID of the selected vehicle. It presents a view that allows editing the item's details.
router.get(
  "/edit/:inv_id",
  authorizeEmployeeAdmin,
  utilities.handleError(invController.editInventoryView)
);

// Route to handle inventory update submission
router.post(
  "/edit",
  authorizeEmployeeAdmin,
  inventoryValidation.inventoryRules(),
  inventoryValidation.checkInventoryData,
  utilities.handleError(invController.updateInventory)
);
router.get(
  "/delete/:inv_id",
  authorizeEmployeeAdmin,
  utilities.handleError(invController.deleteInventoryView)
);

// Route to handle inventory deletion
router.post(
  "/delete",
  authorizeEmployeeAdmin,
  inventoryValidation.deleteInventoryRules(),
  inventoryValidation.checkDeleteData,
  utilities.handleError(invController.deleteInventory)
);
module.exports = router;
