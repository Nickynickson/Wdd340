/******************
 *Account routes
 *Unit 4, deliver login view activity
*******************/
//Needed Resources
const express = require('express');
const router = new express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');

/*********
 * Deliver Login View
 * Unit 4, deliver login view activity
 **********/
router.get('/login', utilities.handleError(accountController.buildLogin)
);

/*********
 * Deliver Register View
 * Unit 4, deliver register view activity
 **********/
router.get('/register', utilities.handleError(accountController.buildRegister));
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleError(accountController.registerAccount)
);


module.exports = router;


