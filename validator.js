// Validator.js - v3.2
// 
// JSON Schema Validator for API w/ a middleware for express
// Developed by Nijiko Yonskai <nijikokun@gmail.com>
// Copyright 2013
var Validator = function (schema, middleware) {
  this.schema = schema;
  this.parameters = Object.keys(this.schema);
  this.errors = { };
  this.retrieved = {};
  this.debug = false;
  
  if (middleware) return this.middleware;
};

// Plugin System
Validator.plugins = {};

Validator.implement = function (field, callback) {
  Validator.plugins[field] = function (details, key, data) {
    var $this = this
      , option = { 
      details: details,
      field: field,
      value: details[field], 
      key: key,
      data: data,
      error: function (type, message) {
        if (typeof message === 'undefined') 
          message = type,
          type = undefined;

        $this.error(key, type || field, message, option);
      }
    };

    callback.call(this, option);

    return this.checkErrors();
  };
};

// Validator Initialization Methods
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

// Parameter Check
//
// Retrieves data from either an express method, or explicitly given object.
Validator.prototype.param = function (key) {
  if (this.against.param) return this.against.param(key);
  return this.against[key];
};

// Roundup
//
// Gathers all sent data either through a request, or given explicitly,
// for fields that exist inside of the current schema.
Validator.prototype.roundup = function () {
  return this.loop(function (key, data) {
    if (this.schema[key]) {
      if (data = this.param(key))
        this.retrieved[key] = data;
      else if (this.schema[key].required && typeof this.schema[key].default === 'undefined')
        this.error(key, "required", "This parameter is required.");
      else if (typeof this.schema[key].default !== 'undefined')
        this.retrieved[key] = this.schema[key].default;
    }
  });
};

// Validation
Validator.prototype.validate = function () {
  // Retrieve the data initially
  // Check for errors after initial fetching.
  if (this.roundup()) return this.errors;

  // Loop through validations for each key
  if (this.loop(function (key, data) {
    var details = this.schema[key];
    var fields = Object.keys(details), field, i = 0;

    for (i; i < fields.length; i++)
      if (field = fields[i])
        if (Validator.plugins[field])
          if (Validator.plugins[field].call(this, details, key, data))
            return this.errors;
  })) return this.errors;
  
  // Return retrieved data
  return this.retrieved;
};

// Error Management
Validator.prototype.error = function (key, type, message, option) {
  if (!this.errors._error) this.errors._error = true;
  if (!this.errors[key]) this.errors[key] = {};
  this.errors[key][type] = { message: message };

  if (option && this.debug && typeof option.data !== "undefined")
    this.errors[key][type].value = option.data;
};

Validator.prototype.checkErrors = function () {
  return (Object.keys(this.errors).length > 0);
};

// Validation Looper
//
// Loops through the parameters in the schema, and gets the retrieved data which is then 
// passed along to the given callback as `key` and `data` arguments.
Validator.prototype.loop = function (callback) {
  var i = 0, key, data;

  for (i; i < this.parameters.length; i++) {
    key = this.parameters[i];
    data = this.retrieved[key];
    callback.call(this, key, data);
  }

  // Clear stored data
  key = data = i = null;

  // Check errors
  return this.checkErrors();
};

// Validator Implementation
//
// Field: `type`
//
// Checks whether value is function to support using native words.
// Checks against `Object.prototype.toString.call` for exact type rather than `typeof`.
// By doing so it requires that the field starts with a capitol letter such as: `String`.
Validator.implement("type", function (options) {
  if (typeof options.value === 'function')
    options.value = options.value.name;

  if (Object.prototype.toString.call(options.data) !== "[object " + options.value + "]")
    options.error("Invalid parameter data type, expected: " + options.value);
});

// Validator Implementation
//
// Field: `length`
//
// Supports: `Number` or `Object` with `min` and `max` values.
//
// Checks given data length against a numerical value, when the field is an object we check against
// the `min` and `max` values. If the field is simply a numeric value we check for equality.
Validator.implement("length", function (options) {
  if (typeof options.data === "undefined") return;

  // Check whether length exists, otherwise use value
  options.against = options.data.length ? options.data.length : options.data;

  // Do Checks
  if (typeof options.value === "object")
    if (options.value.min) 
      if (options.value.min > options.against) 
        options.error("min", "Must be greater than " + options.value.min + (options.data.type === "string" ? " characters long." : ""));
    if (options.value.max) 
      if (options.value.max < options.against) 
        options.error("max", "Must be less than " + options.value.max + (options.data.type === "string" ? " characters long." : ""));
  else if (typeof options.value === "number")
    if (options.value != options.against)
      options.error("Must be " + options.value + " characters long.");
});

// Validator Implementation
//
// Field: `test`
//
// Supports: `RegExp` or `Array` of `RegExp`
//
// Checks given data against a single `RegExp` using `.test` or an `Array` of `RegExp` using `.test`
Validator.implement("test", function (options) {
  if (Object.prototype.toString.call(options.value) === "[object Array]") {
    var i = 0, regex;

    for (i; i < options.value.length; i++) {
      if (!options.value[i].test(options.data.toString()))
        options.error("test-" + i, "Parameter data did not pass regex test.");
    }
  } else {
    if (!options.value.test(options.data))
      options.error("Parameter data did not pass regex test.");
  }
});

// Export our module
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Validator;
else
  if (typeof define === 'function' && define.amd)
    define([], function() {
      return Validator;
    });
  else
    window.Validator = Validator;