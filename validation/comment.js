const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateCommentInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, { min: 1, max: 200 })) {
    errors.text = "Comment must be between 1 and 200 characters";
  }

  if (Validator.isEmpty(data.text)) {
    errors.text = "Text field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
