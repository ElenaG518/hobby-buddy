const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator/check');

const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const jwtAuth = passport.authenticate('jwt', { session: false });

// @route    POST api/posts
// @desc     Create a post
// @access   Private

router.post(
  '/',
  [
    jwtAuth,
    [
      check('content', 'Please add the content to your post')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id);

      const newPost = {
        user: req.user.id,
        name: user.name,
        username: user.username,
        content: req.body.content,
        avatar: user.avatar
      };

      const post = await Post.create(newPost);

      res.json(post);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal Server Error');
    }
  }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Private

router.get('/', jwtAuth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
