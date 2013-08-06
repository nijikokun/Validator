// Developed By Nijiko Yonskai
// JSON Schema Validator for API w/ a middleware for express
// Copyright 2013

var Validator = require('./validator');

var schema = {
  username: {
    type: "String",
    required: true,
    length: {
      min: 3,
      max: 36
    },
    test: /^[a-z0-9]+$/gi
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

system.route = function (req, res) {
  var validator = new Validator(schema);
  console.log(req.param('message'), validator.check(req.param('user')));
};

// Impersonate requests

// This should pass
system.route(new system({
  message: 'Should pass:',
  user: {
    username: 'Nijikokun',
    password: 'password'
  }
}));

// This should not pass due to missing password
system.route(new system({
  message: 'Should fail:',
  user: {
    username: 'Niji%kokun'
  }
}));

// This should not pass due to invalid username
system.route(new system({
  message: 'Should fail:',
  user: {
    username: 'Niji%kokun',
    password: 'password'
  }
}));