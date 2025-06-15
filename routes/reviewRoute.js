const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");
const reviewValidation = require("../utilities/review-validation");

// Apply middleware to parse incoming request bodies (if not already applied in app.js)
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Route to fetch reviews for a specific vehicle
router.get("/reviews/:inv_id", reviewController.getVehicleReviews);

// Route to submit a new review with authentication and validation
router.post(
  "/add", 
  utilities.checkLogin, 
  reviewValidation.reviewRules(), 
  reviewValidation.checkValidationResults, 
  reviewController.addReview 
);

module.exports = router;
