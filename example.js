// Developed By Nijiko Yonskai
// JSON Schema Validator for API w/ a middleware for express
// Copyright 2013

var schema = {
  username: {
    type: "String",
    required: true,
    length: {
      min: 3,
      max: 36
    },
    match: /[a-z0-9]/gi
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

var Validator = function (schema, middleware) {
  this.schema = schema;
  this.parameters = Object.keys(this.schema);
  this.errors = { _error: true };
  this.retrieved = {};
  
  if (middleware) return validator.middleware;
};

// Validator init methods
Validator.prototype.middleware = function (req, res, next) {
  this.against = req;
  var results = this.validate();
  
  if (results._error) return res.send(500, results);
  else req.validated = results;
  
  next();
};

Validator.prototype.check = function (against) {
  this.against = against;
  return this.validate();
};

// Parameter Checking
Validator.prototype.param = function (key) {
  if (this.against.param) return this.against.param(key);
  return this.against[key];
};

Validator.prototype.roundup = function () {
  this.loop(function (key, data) {
    if (this.schema[key]) {
      if (data = this.param(key))
        this.retrieved[key] = data;
      else if (this.schema[key].required)
        this.error(key, "This parameter is required.");
    }
  });
};

// Validation methods
Validator.prototype.validate = function () {
  // Retrieve the data initially
  this.roundup();
  if (this.checkErrors()) return this.errors;

  // Loop through validations for each key
  if (this.loop(function (key, data) {
    var details = this.schema[key];
    if (details.type) if (this.validate.type.call(this, details, key, data)) return this.errors;
    if (details.length) if (this.validate.lengths.call(this, details, key, data)) return this.errors;
    if (details.match) if (this.validate.matches.call(this, details, key, data)) return this.errors;
  })) return this.errors;

  return this.retrieved;
};

Validator.prototype.validate.type = function (details, key, data) {
  if (Object.prototype.toString.call(data) !== "[object " + details.type + "]")
    this.error(key, "Invalid parameter data type, expected: " + details.type);

  return this.checkErrors();
};

Validator.prototype.validate.lengths = function (details, key, data) {
  if (typeof details.length === "object")
    if (details.length.min) 
      if (details.length.min > data.length) this.error(key, "Must be at least " + details.length.min + " characters long.");
    if (details.length.max) 
      if (details.length.max < data.length) this.error(key, "Must be less than " + details.length.max + " characters long.");
  else if (typeof details.length === "number")
    if (details.length != data.length)
      this.error(key, "Must be " + details.length + " characters long.");

  return this.checkErrors();
};

Validator.prototype.validate.matches = function (details, key, data) {
  if (typeof details.match === "object") {
    var i = 0, regex;

    for (i; i < details.match.length; i++) {
      regex = details.match[i];
      if (!regex.test(data.toString()))
        this.error(key, "Recieved data did not match regex test: " + regex.toString());
    }
  }

  return this.checkErrors();
};

// Error Management
Validator.prototype.error = function (key, message) {
  if (!this.errors[key]) this.errors[key] = [];
  this.errors[key].push({ message: message });
};

Validator.prototype.checkErrors = function () {
  return (Object.keys(this.errors).length > 0);
};

// The Iterator
Validator.prototype.loop = function (callback) {
  var i = 0, key, data;

  for (i; i < this.parameters.length; i++) {
    key = this.parameters[i];
    data = this.retrieved[key];
    return callback.call(this, key, data);
  }
};

system.route(req);