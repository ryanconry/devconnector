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
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
  // const newUser = new User({
  //   name: "Ryan",
  //   email: "test@test.com",
  //   password: "12345"
  // });
  // newUser
  //   .save()
  //   .then(user => res.json(user))
  //   .catch(err => console.log(err));
});

module.exports = router;
