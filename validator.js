// Validator.js - v3 - Developed By Nijiko Yonskai
// JSON Schema Validator for API w/ a middleware for express
// Copyright 2013
var Validator = function (schema, middleware) {
  this.schema = schema;
  this.parameters = Object.keys(this.schema);
  this.errors = { };
  this.retrieved = {};
  
  if (middleware) return this.middleware;
};

// Plugin System
Validator.plugins = {};

Validator.implement = function (field, callback) {
  Validator.plugins[field] = function (details, key, data) {
    callback.call(this, details, key, data);
    return this.checkErrors();
  };
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
        this.error(key, "required", "This parameter is required.");
    }
  });
};

// Validation
Validator.prototype.validate = function () {
  // Retrieve the data initially
  this.roundup();
  if (this.checkErrors()) return this.errors;

  // Loop through validations for each key
  if (this.loop(function (key, data) {
    var details = this.schema[key];
    var fields = Object.keys(details), field, i = 0;
    for (i; i < fields.length; i++) {
      field = fields[i];
  
      if (Validator.plugins[field])
        if (Validator.plugins[field].call(this, details, key, data))
          return this.errors;
    }
  })) return this.errors;
  
  return this.retrieved;
};

// Error Management
Validator.prototype.error = function (key, type, message) {
  if (!this.errors._error) this.errors._error = true;
  if (!this.errors[key]) this.errors[key] = {};
  this.errors[key][type] = { message: message };
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

// Implementations
Validator.implement("type", function (details, key, data) {
  if (Object.prototype.toString.call(data) !== "[object " + details.type + "]")
    this.error(key, "type", "Invalid parameter data type, expected: " + details.type);
});
        
Validator.implement("length", function (details, key, data) {
  if (typeof details.length === "object")
    if (details.length.min) 
      if (details.length.min > data.length) this.error(key, "min", "Must be at least " + details.length.min + " characters long.");
    if (details.length.max) 
      if (details.length.max < data.length) this.error(key, "max", "Must be less than " + details.length.max + " characters long.");
  else if (typeof details.length === "number")
    if (details.length != data.length)
      this.error(key, "length", "Must be " + details.length + " characters long.");
});

Validator.implement("test", function (details, key, data) {
  if (Object.prototype.toString.call(details.test) === "[object Array]") {
    var i = 0, regex;

    for (i; i < details.test.length; i++) {
      regex = details.test[i];
      if (!regex.test(data.toString()))
        this.error(key, "test-" + i, "Parameter data did not pass regex test.");
    }
  } else if (details.test.test(data.toString()) === false)
    this.error(key, "test", "Parameter data did not pass regex test.");
});