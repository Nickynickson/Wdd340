//Account controller

const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

//deliver the login page

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* **************************************** *
 * Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* **************************************** *
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    // Using asynchronous bcrypt.hash instead of synchronous hashSync for better performance
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    console.error("Error hashing password:", error);
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

async function accountLogin(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      return res.redirect("/account/");
    } else {
      req.flash(
        "notice",
        "Invalid password. Please check your credentials and try again."
      );
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    next(error);
  }
}

async function buildAccountHome(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    message: "You're logged in",
    errors: null,
    accountData: res.locals.accountData,
  });
}

/* **************************************** *
 * Deliver account update view
 * *************************************** */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    accountData: res.locals.accountData,
  });
}

/* **************************************** *
 * Process account update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email } = req.body;
  const account_id = res.locals.accountData.account_id;

  // If there are validation errors from middleware, they will be in req.errors
  if (req.errors) {
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: req.errors,
      accountData: res.locals.accountData,
    });
  }

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      // Update the JWT with the new data
      const updatedAccount = await accountModel.getAccountById(account_id);
      if (!updatedAccount) {
        throw new Error("Failed to retrieve updated account information");
      }

      delete updatedAccount.account_password;
      const accessToken = jwt.sign(
        updatedAccount,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });

      req.flash("notice", "Account updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the update failed.");
      res.status(501).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        accountData: res.locals.accountData,
      });
    }
  } catch (error) {
    console.error("Error updating account:", error);
    req.flash("notice", "An error occurred during the update process.");
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: res.locals.accountData,
    });
  }
}

/* **************************************** *
 * Process password change
 * *************************************** */
async function updateAccountPassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_password, account_password_confirm } = req.body;
  const account_id = res.locals.accountData.account_id;

  // If there are validation errors from middleware, they will be in req.errors
  if (req.errors) {
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: req.errors,
      accountData: res.locals.accountData,
    });
  }

  // Check if passwords match
  if (account_password !== account_password_confirm) {
    req.flash("notice", "Passwords do not match.");
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: res.locals.accountData,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(
      account_id,
      hashedPassword
    );

    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the password update failed.");
      res.status(501).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        accountData: res.locals.accountData,
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    req.flash("notice", "Sorry, the password update failed.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: res.locals.accountData,
    });
  }
}

async function logout(req, res, next) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountHome,
  buildAccountUpdate,
  updateAccount,
  updateAccountPassword,
  logout,
};
