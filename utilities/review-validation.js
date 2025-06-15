const { body, validationResult } = require("express-validator");

/**
 * Defines validation rules for vehicle reviews
 * @returns {Array} Array of validation middleware
 */
const reviewRules = () => {
  return [
    // Validate rating - must be between 1 and 5
    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be a number between 1 and 5"),

    // Validate review text - must not be empty
    body("reviewText")
      .notEmpty()
      .withMessage("Review text is required")
      .isLength({ min: 3, max: 1000 })
      .withMessage("Review text must be between 3 and 1000 characters"),

    // Validate vehicleId - must exist
    body("inv_id")
      .notEmpty()
      .withMessage("Vehicle ID is required")
      .isInt()
      .withMessage("Vehicle ID must be a number"),
  ];
};

/**
 * Checks validation results and handles errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} Returns error response or proceeds to next middleware
 */
const checkValidationResults = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error("Validation Errors:", errors.array()); // Log validation errors for debugging

    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(" ");
    req.flash("notice", errorMessages);
    return res.redirect(`/inventory/detail/${req.body.inv_id}`);
  }

  next();
};

module.exports = {
  reviewRules,
  checkValidationResults,
};
