/**
 * Review Controller
 * Handles review-related operations, optimized for web applications.
 */

const { validationResult } = require("express-validator");
const reviewModel = require("../models/review-model");

/**
 * Get reviews for a specific vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getVehicleReviews(req, res, next) {
  try {
    const inv_id = req.params.inv_id;

    if (!inv_id) {
      req.flash("notice", "Invalid vehicle ID");
      return res.redirect("/inventory");
    }

    const reviews = await reviewModel.getReviewsByVehicleId(inv_id);
    req.reviews = reviews;
    next();
  } catch (error) {
    console.error("Error in getVehicleReviews:", error);
    req.flash("notice", "Failed to retrieve reviews");
    next(error);
  }
}

/**
 * Add a new review for a vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function addReview(req, res, next) {
  try {
    if (!res.locals.loggedin) {
      req.flash("notice", "You must be logged in to add a review");
      return res.redirect("/account/login");
    }

    // Validate the request using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash(
        "notice",
        errors
          .array()
          .map((err) => err.msg)
          .join(" ")
      );
      return res.redirect(`/inv/detail/${req.body.inv_id}`);
    }

    // Extract and sanitize data
    const { inv_id, rating, reviewText } = req.body;
    const account_id = res.locals.accountData.account_id;

    const reviewData = {
      account_id,
      inv_id: inv_id,
      rating,
      review_text: reviewText, // Already sanitized by express-validator
      created_at: new Date(),
    };

    const result = await reviewModel.insertReview(reviewData);
    if (result) {
      req.flash("notice", "Review added successfully");
      return res.redirect(`/inv/detail/${inv_id}`);
    } else {
      throw new Error("Failed to add review");
    }
  } catch (error) {
    console.error("Error in addReview:", error);
    req.flash("notice", "Failed to add review");
    next(error);
  }
}

module.exports = {
  getVehicleReviews,
  addReview,
};
