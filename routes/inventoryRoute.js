// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:id", invController.getVehicleDetail);


/* Middleware to handle 404 errors
router.get('/trigger-error', (req, res, next) => {
  const error = new Error('Intentional error triggered.');
  error.status = 500;
  next(error); // Pass the error to middleware
});
  });
});*/

module.exports = router;