const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

//load user model
const User = require("../../models/User");

//@route    GET api/users/test
//@desc     Test users route
//@access   Public
router.get("/test", (req, res) => res.json({ msg: "users works" }));

//@route    GET api/users/register
//@desc     Register users route
//@access   Public
router.post("/register", (req, res) => {
  //submit new user form
  User.findOne({ email: req.body.email }) //check if submitted email exists in db
    .then(user => {
      if (user) {
        return res.status(400).json({ email: "Email already exists" }); //if user exists, respond with 400 status and message
      } else {
        //create new user from submitted form
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
        bcrypt.genSalt(10, (err, salt) => {
          //generate salt to encrypt password
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            //hash plain text password with salt
            if (err) throw err;
            newUser.password = hash; //save hashed password
            newUser
              .save() //save user to db
              .then(user => res.json(user)) //confirm user was saved
              .catch(err => console.log(err)); //notify of an error
          });
        });
      }
    });
});

//@route    GET api/users/register
//@desc     Login users / Returning JWT Token
//@access   Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Find user by email in mongodb
  User.findOne({ email: email }) //using User schema
    .then(user => {
      //promise returned, if email exists, user object is returned from db
      //check for user
      if (!user) {
        return res
          .status(404)
          .json({ email: "Email not registered with devconnect" });
      }

      //check for password
      bcrypt.compare(password, user.password).then(isMatch => {
        //compare method will check plain text password submitted against hashed pw
        if (isMatch) {
          res.json({ msg: "Success" });
        } else {
          return res.status(400).json({ password: "Password incorrect" });
        }
      });
    });
});

module.exports = router;
