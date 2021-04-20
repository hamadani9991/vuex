const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('../../config/kyes').secret
const passport = require('passport');
const User = require('../../models/User')

//  @route POST api/users/register
// @ Register the user
// @access Public

router.post('/register', (req, res) => {
  let {
    name,
    username,
    email,
    password,
    confirm_password
  } = req.body
  if (password !== confirm_password) {
    return res.status(200).json({
      msg: "Password do not match."
    });
  }
  // Check for the unique Username
  User.findOne({
    username: username
  }).then(user => {
    if (user) {
      return res.status(200).json({
        msg: "Username is already taken."
      });
      response.setHeader("Content-Type", "text/html");
    }
  })
  // Check for the Unique Email
  User.findOne({
    email: email
  }).then(user => {
    if (user) {
      return res.status(200).json({
        msg: "Email is already registred. Did you forgot your password."
      });
    }
  });
  // The data is valid and new we can register the user
  let newUser = new User({
    name,
    username,
    password,
    email
  });
  // Hash the password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save().then(user => {
        return res.status(201).json({
          success: true,
          msg: "Hurry! User is now registered."
        });
      });
    });
  });
});


// Login route Post req

router.post('/login', (req, res) => {
  User.findOne({username: req.body.username}).then(user => {
    if(!user) {
      return res.status(404).json({
        msg: 'Username is not found',
        success: false
      })
    }
    // if there is user we are now going to compare the passowrd
    bcrypt.compare(req.body.password, user.password).then(isMatch => {
      if(isMatch) {
        const payload = {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email
        }
        jwt.sign(payload, key, {
          expiresIn: 604800
        }, (err, token) => {
          res.status(200).json({
            success: true,
            token: `Bearer ${token}`,
            msg: "you are now logged in"
          })
        })
      } else {
        return res.status(404).json({
          msg: 'Icorrect password',
          success: false
        })
      }
    })
  });
})

// Protected route
router.get('/profile', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  return res.json({
    user: req.user
  });
})


module.exports = router