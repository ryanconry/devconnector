const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Validation
const validatePostInput = require("../../validation/post");
const validateCommentInput = require("../../validation/comment");
//Post model
const Post = require("../../models/Post");

//@route    GET api/posts/test
//@desc     Test post route
//@access   Public
router.get("/test", (req, res) => res.json({ msg: "posts works" }));

//@route    GET api/posts
//@desc     Get all posts
//@access   Public
router.get("/", (req, res) => {
  const errors = {};
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      if (!posts) {
        errors.posts = "There are no posts";
        return res.status(404).json(errors);
      }
      res.status(200).json(posts);
    });
});

//@route    GET api/posts/:id
//@desc     Get a post given an ID
//@access   Public
router.get("/:id", (req, res) => {
  const errors = {};
  Post.findById(req.params.id)
    .then(post => {
      if (!post) {
        errors.nopost = "Could not find a post with that ID";
        return res.status(404).json(errors);
      }
      res.status(200).json(post);
    })
    .catch(err => rest.status(404).json({ msg: err }));
});

//@route    POST api/posts
//@desc     Create a post
//@access   Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      //If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      user: req.user.id
    });

    console.log(req.user);

    newPost.save().then(post => res.json(post));
  }
);

//@route    DELETE api/posts/:id
//@desc     Delete a post given an ID
//@access   Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById({ _id: req.params.id })
      .then(post => {
        if (!post) {
          errors.noPost = "There is post";
          return res.status(404).json(errors);
        }
        if (post.user != req.user.id) {
          errors.wrongUser = "You can not delete another users posts";
          return res.status(400).json(errors);
        }
        post
          .remove()
          .then(() => res.json({ success: true }))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);

//@route    POST api/posts/like/:id
//@desc     Like a post given an ID
//@access   Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById({ _id: req.params.id }).then(post => {
      if (!post) {
        errors.noPost = "There is no post with this id";
        return res.status(404).json(errors);
      }
      if (post.likes.find(x => x.user == req.user.id)) {
        errors.userExists = "User has already liked this post";
        return res.status(400).json(errors);
      }

      post.likes.push({ user: req.user.id });
      post.save().then(post => res.json(post));
    });
  }
);

//@route    POST api/posts/unlike/:id
//@desc     Unlike a post given an ID
//@access   Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById({ _id: req.params.id }).then(post => {
      if (!post) {
        errors.noPost = "There is no post with this id";
        return res.status(404).json(errors);
      }
      if (!post.likes.find(x => x.user == req.user.id)) {
        errors.userExists = "User has not liked this post";
        return res.status(400).json(errors);
      }
      post.likes = post.likes.filter(x => x.user != req.user.id);
      post.save().then(post => res.status(200).json(post));
    });
  }
);

//@route    POST api/posts/uncomment/:id/:commentid
//@desc     Remove a comment of post given post ID and comment ID
//@access   Private
router.post(
  "/uncomment/:id/:commentid",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Post.findById({ _id: req.params.id })
      .then(post => {
        if (!post) {
          errors.noPost = "There is no post with this id";
          return res.status(404).json(errors);
        }

        const removeIndex = post.comments
          .map(item => item.id)
          .indexOf(req.params.commentid);
        if (post.comments[removeIndex].user != req.user.id) {
          errors.notUser = "You can not remove another users comment";
          return res.status(400).json(errors);
        }
        post.comments.splice(removeIndex, 1);

        res.json(post);

        post
          .save()
          .then(post => res.json(post))
          .catch(err => res.status(404).json(err));
      })
      .catch(err => console.log(err));
  }
);

//@route    POST api/posts/:id
//@desc     Unlike a post given an ID
//@access   Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);

    if (!isValid) {
      //If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    Post.findById({ _id: req.params.id }).then(post => {
      if (!post) {
        errors.noPost = "There is no post with this id";
        return res.status(404).json(errors);
      }
      const newComment = {
        text: req.body.text,
        name: req.user.name,
        user: req.user.id
      };
      post.comments.push(newComment);
      post.save().then(post => res.json(post));
    });
  }
);

module.exports = router;
