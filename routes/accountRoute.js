//Needed Resources
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidator = require("../utilities/account-validation");
const {
  updateAccountRules,
  updatePasswordRules,
  checkUpdateValidation,
} = require("../utilities/account-update-validation");
const { body, validationResult } = require("express-validator");

//Delievering the Default routes
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleError(accountController.buildAccountHome)
);
router.get("/login", utilities.handleError(accountController.buildLogin));
router.post(
  "/login",
  [
    // Validate email
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Email is required")
      .normalizeEmail()
      .isEmail()
      .withMessage("A valid email is required"),

    // Validate password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required"),
  ],
  // Check validation results
  async (req, res, next) => {
    const { account_email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav();
      res.render("account/login", {
        title: "Login",
        nav,
        errors: errors.array(),
        account_email,
      });
    } else {
      next();
    }
  },
  utilities.handleError(accountController.accountLogin)
);
router.get("/register", utilities.handleError(accountController.buildRegister));
router.post(
  "/register",
  regValidator.registrationRules(),
  regValidator.checkRegData,
  utilities.handleError(accountController.registerAccount)
);

router.get("/logout", utilities.handleError(accountController.logout));

// Account update routes
router.get(
  "/edit/:id",
  utilities.checkLogin,
  utilities.handleError(accountController.buildAccountUpdate)
);

// Process account update form
router.post(
  "/update",
  utilities.checkLogin,
  updateAccountRules(),
  checkUpdateValidation,
  utilities.handleError(accountController.updateAccount)
);

// Process password change form
router.post(
  "/update-password",
  utilities.checkLogin,
  updatePasswordRules(),
  checkUpdateValidation,
  utilities.handleError(accountController.updateAccountPassword)
);

module.exports = router;
