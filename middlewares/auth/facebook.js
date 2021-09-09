require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
}); // Config environment

const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const { User } = require("../../models");

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    /* istanbul ignore next */
    async function (accessToken, refreshToken, profile, done) {
      let user = await User.findOne({ email: profile._json.email });

      if (!user) {
        const data = {
          username: profile._json.email.split("@")[0],
          fullname: profile._json.name,
          email: profile._json.email,
          password: profile._json.id,
          photo: profile._json.picture.data.url,
        };
        user = await User.create(data);
      }

      return done(null, user);
    }
  )
);
