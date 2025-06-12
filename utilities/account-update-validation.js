const { body, validationResult } = require('express-validator');
const accountModel = require('../models/account-model');

// Validation rules for updating account information
function updateAccountRules() {
  return [
    body('account_firstname')
      .trim()
      .notEmpty()
      .withMessage('First name is required.'),
    body('account_lastname')
      .trim()
      .notEmpty()
      .withMessage('Last name is required.'),
    body('account_email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .isEmail()
      .withMessage('A valid email is required.')
      .custom(async (email, { req }) => {
        // Only check if the email has changed
        if (req.body.current_email && email === req.body.current_email) {
          return true;
        }
        const existingAccount = await accountModel.getAccountByEmail(email);
        if (existingAccount && existingAccount.account_id !== Number(req.body.account_id)) {
          return Promise.reject('That email is already in use.');
        }
        return true;
      })
  ];
}

// Validation rules for updating password
function updatePasswordRules() {
  return [
    body('account_password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.'),
    body('account_password_confirm')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.account_password) {
          throw new Error('Passwords do not match.');
        }
        return true;
      })
  ];
}

// Middleware to check validation results
function checkUpdateValidation(req, res, next) {
  const { errors } = validationResult(req);
  if (errors && errors.length > 0) {
    // Re-render the update view with errors and the original form data
    const utilities = require('../utilities');
    utilities.getNav().then(nav => {
      res.status(400).render('account/update', {
        title: 'Update Account',
        nav,
        errors,
        accountData: { ...res.locals.accountData, ...req.body }
      });
    }).catch(err => next(err));
  } else {
    next();
  }
}

module.exports = {
  updateAccountRules,
  updatePasswordRules,
  checkUpdateValidation
};