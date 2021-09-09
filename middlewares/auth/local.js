const passport = require("passport"); // Import passport
const LocalStrategy = require("passport-local").Strategy; // Login but not using likes Google Login, Facebook Login
const bcrypt = require("bcrypt"); // to compare the password
const JWTstrategy = require("passport-jwt").Strategy; // to enable jwt in passport
const ExtractJWT = require("passport-jwt").ExtractJwt; // to extract or read jwt
const { User } = require("../../models"); // Import user
const validator = require("validator");

// Logic to register
exports.register = (req, res, next) => {
  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) {
      return next({ message: err.message, statusCode: 401 });
    }

    if (!user) {
      return next({ message: info.message, statusCode: 401 });
    }

    req.user = user;

    next();
  })(req, res, next);
};

passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const data = await User.create(req.body);

        return done(null, data, { message: "User can be created" });
      } catch (e) {
        return done(e, false, { message: "User can't be created" });
      }
    }
  )
);

// isLoggedIn logic
exports.isLoggedIn = (req, res, next) => {
  passport.authorize("isLoggedIn", { session: false }, (user) => {
    if (!user) {
      return next({ message: "You have to login", statusCode: 401 });
    }
    req.user = user;
    next();
  })(req, res, next);
};

passport.use(
  "isLoggedIn",
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        if (token) {
          return done(token);
        }
        return done(false);
      } catch (error) {
        /* istanbul ignore next */
        return done(false);
      }
    }
  )
);

// Logic to login
exports.login = (req, res, next) => {
  if (validator.isEmail(req.body.username)) {
    passport.authenticate("loginEmail", { session: false }, (err, user, info) => {
      if (err) {
        return next({ message: err.message, statusCode: 401 });
      }

      if (!user) {
        return next({ message: info.message, statusCode: 401 });
      }

      req.user = user;

      next();
    })(req, res, next);
  } else {
    passport.authenticate("loginUsername", { session: false }, (err, user, info) => {
      if (err) {
        return next({ message: err.message, statusCode: 401 });
      }

      if (!user) {
        return next({ message: info.message, statusCode: 401 });
      }

      req.user = user;

      next();
    })(req, res, next);
  }
};

passport.use(
  "loginEmail",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        data = await User.findOne({ email: req.body.username });

        if (!data) {
          return done(null, false, { message: "User is not found!" });
        }

        const isGoogle = await bcrypt.compare("google", data.password);
        if (isGoogle) {
          return done(null, false, { message: `Please login with google.` });
        }

        const isFacebook = await bcrypt.compare("facebook", data.password);
        if (isFacebook) {
          return done(null, false, { message: `Please login with facebook.` });
        }

        const validate = await bcrypt.compare(req.body.password, data.password);

        if (!validate) {
          return done(null, false, { message: "Wrong password!" });
        }

        return done(null, data, { message: "Login success!" });
      } catch (e) {
        /* istanbul ignore next */
        return done(e, false, { message: "User can't be created" });
      }
    }
  )
);

passport.use(
  "loginUsername",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        data = await User.findOne({ username: req.body.username });

        if (!data) {
          return done(null, false, { message: "User is not found!" });
        }

        const isGoogle = await bcrypt.compare("google", data.password);
        if (isGoogle) {
          return done(null, false, { message: `Please login with google.` });
        }

        const isFacebook = await bcrypt.compare("facebook", data.password);
        if (isFacebook) {
          return done(null, false, { message: `Please login with facebook.` });
        }

        const validate = await bcrypt.compare(req.body.password, data.password);

        if (!validate) {
          return done(null, false, { message: "Wrong password!" });
        }

        return done(null, data, { message: "Login success!" });
      } catch (e) {
        /* istanbul ignore next */
        return done(e, false, { message: "User can't be created" });
      }
    }
  )
);

exports.updateUserDatabase = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      user = await User.create(req.body);
    }

    req.user = user;

    next();
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};
