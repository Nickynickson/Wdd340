const authorizeEmployeeAdmin = (req, res, next) => {
  if (res.locals.accountData && (res.locals.accountData.account_type === 'Employee' || res.locals.accountData.account_type === 'Admin')) {
    return next();
  } else {
    req.flash('notice', 'Access denied. Please log in with an authorized account.');
    return res.redirect('/account/login');
  }
};

module.exports = authorizeEmployeeAdmin;