'use strict';
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const User = require('../models/User');
const config = require('config');
const JWT_SECRET = config.get('jwtSecret');

// allowed the user to supply a username and password to authenticate with an endpoint;
const localStrategy = new LocalStrategy(
  async (username, password, callback) => {
    try {
      let user = await User.findOne({ username });
      if (!user) {
        let err = {
          reason: 'LoginError',
          message: 'Incorrect username or password'
        };
        return callback(null, false, err);
      }

      // returns a boolean value indicating whether or not the password is valid
      let isValid = await user.validatePassword(password);

      if (!isValid) {
        let err = {
          reason: 'LoginError',
          message: 'Incorrect username or password'
        };
        return callback(null, false, err);
      }
      // this is where we need to return user after the password has been verified as valid
      // the user object will be added to the request object at req.user
      return callback(null, user);
    } catch (err) {
      return callback(err, false);
    }
  }
);

// new JwtStrategy(options, verify)
// http://www.passportjs.org/packages/passport-jwt/

// verify is a function with the parameters verify(jwt_payload, done)
// jwt_payload is an object literal containing the decoded JWT payload.
// done is a passport error first callback accepting arguments done(error, user, info)

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    // Look for the JWT as a Bearer auth header
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    // Only allow HS256 tokens - the same as the ones we issue
    algorithms: ['HS256']
  },
  // payload is an object literal containing the decoded JWT payload.
  (payload, done) => {
    done(null, payload.user);
  }
);

module.exports = { localStrategy, jwtStrategy };
