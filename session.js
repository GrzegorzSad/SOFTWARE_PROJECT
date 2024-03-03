function attachSessionData(req, res, next) {
  res.locals.userId = req.session.userId;
  res.locals.username = req.session.username;
  res.locals.role = req.session.role;
  next();
}

module.exports = attachSessionData;