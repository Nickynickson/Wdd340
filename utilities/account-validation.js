const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */

validate.registrationRules = () => {
  return [
    ///firstname is required
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("First name is required"),

    //lastname is required
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Last name is required"),

    //Validate email is required
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .normalizeEmail()
      .isEmail()
      .withMessage("A valid email is required"),

    //Validate password is required
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password is required"),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
    });
  } else {
    next();
  }
};

module.exports = validate;
