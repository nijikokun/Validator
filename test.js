// Developed By Nijiko Yonskai
// JSON Schema Validator for API w/ a middleware for express
// Copyright 2013

var Validator = require('./validator');

var schema = {
  id: {
    type: Number,
    default: 1,
    length: {
      min: 1,
      max: 200
    }
  },
  username: {
    type: "String",
    required: true,
    length: {
      min: 3,
      max: 36
    },
    test: /^[a-z0-9]+$/i
  },
  password: {
    type: String,
    required: true
  }
};

// Create our "Express" system, no middleware support though
var system = function (options) {
  this.options = options || {};
};

system.prototype.param = function (item) {
  return this.options[item];
};

var route = function (req, res) {
  var validator = new Validator(schema);

  // Turn on values in error messages
  validator.debug = true;

  console.log(req.param('message'), validator.check(req.param('user')));
};

// Impersonate requests

// This should pass
// Shows defaults, and validation checks.
route(new system({
  message: 'Defaults:',
  user: {
    username: 'Nijikokun',
    password: 'password'
  }
}));

// This should not pass due to invalid identifier (just to show number length yadda yadda)
route(new system({
  message: 'Length:',
  user: {
    id: -25,
    username: 'Nijikokun',
    password: 'password'
  }
}));

// This should not pass due to invalid name
route(new system({
  message: 'Test:',
  user: {
    id: 1,
    username: 'Niji%kokun',
    password: 'password'
  }
}));

// This should not pass due to missing password
// Missing values are checked first, so they proceed all other checks.
route(new system({
  message: 'Required:',
  user: {
    id: 1,
    username: 'Niji%kokun'
  }
}));