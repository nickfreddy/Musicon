const { User } = require("../../models");
const bcrypt = require("bcrypt");

exports.googleLoginSanitizerValidator = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const isGoogle = await bcrypt.compare("google", user.password);

      if (!isGoogle) {
        next({
          statusCode: 401,
          message: "Please login using another method.",
        });
      }
    }

    req.body.username = req.body.email.split("@")[0];
    req.body.fullname = req.body.name;
    req.body.photo = req.body.imageUrl;
    req.body.email = req.body.email;
    req.body.password = "google";

    next();
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};
