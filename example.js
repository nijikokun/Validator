// Developed By Nijiko Yonskai
// JSON Schema Validator for API w/ a middleware for express
// Copyright 2013

// Requires validator.js

var schema = {
  username: {
    type: "String",
    required: true,
    length: {
      min: 3,
      max: 36
    },
    match: /^[a-z0-9]+$/gi
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
  console.log(validator.check(req));
};

// Impersonate Express.js req
var req = new system({
  username: 'Niji%kokun'
});

system.route(req);