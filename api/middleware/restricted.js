const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) next("token required");

  try {
    jwt.verify(authorization, "secret");
    next();
  } catch (err) {
    if (err.message === "invalid signature")
      return res.status(400).send("token invalid");

    return res.status(500).send(err);
  }

  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
};