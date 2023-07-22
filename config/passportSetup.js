const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
let mongoose = require('mongoose');
const User = mongoose.model('User');

require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      // options for strategy
      callbackURL: 'https://befit-backend.codinger.net/auth/google/callback/',
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      console.log(profile);
      const ImgUrl = profile.photos[0].value;
      firstName = profile.name.givenName;

      // check if user already exists
      const currentUser = await User.findOne({ googleId: profile.id });
      if (currentUser) {
        // already have the user -> return (login)
        return done(null, currentUser);
      } else {
        // register user and return
        const newUser = await new User({ email: email, googleId: profile.id, thumbnail : ImgUrl, firstName : firstName }).save();
        return done(null, newUser);
      }
    }
  )
);