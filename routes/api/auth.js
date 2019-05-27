'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

const createAuthToken = function(user) {
  // jwt.sign(payload, secretOrPrivateKey, [options, callback])
  return jwt.sign({ user }, config.get('jwtSecret'), {
    subject: user.name,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', { session: false });

// @route    GET api/auth
// @desc     Test route
// @access   Public

router.get('/', localAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.serialize());
    // res.send('GET auth');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
  }
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public

router.post(
  '/',
  [
    localAuth,
    [
      check('username', 'Please provide your username')
        .not()
        .isEmpty(),
      check('password', 'Please provide your password')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('req.user from login in auth ', req.user);
    const authToken = createAuthToken(req.user.serialize());
    res.json({ authToken });
  }
);

module.exports = router;
