// Developed By Nijiko Yonskai
// JSON Schema Validator for API w/ a middleware for express
// Copyright 2013

var Validator = require('./validator');

var schema = {
  backpack: {
    type: Object,
    required: true,

    team: {
      type: Array,
      required: true,
      length: {
        min: 1,
        max: 6
      }
    },

    inventory: {
      type: Array,
      default: [],
      length: {
        max: 255
      }
    }
  },

  name: {
    type: "String",
    required: true,
    length: {
      min: 3,
      max: 36
    },
    test: /^[a-z0-9]+$/i
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

  console.log(req.param('message'), validator.check(req.param('trainer')));
};

// Impersonate requests

// This should pass
// Shows defaults, and validation checks.
route(new system({
  message: 'Defaults:',
  trainer: {
    backpack: { 
      team: [ 'Bulbasaur' ] 
    },
    name: 'Nijikokun'
  }
}));

// This should not pass due to invalid identifier (just to show number length yadda yadda)
route(new system({
  message: 'Length:',
  trainer: {
    backpack: { 
      team: [ 'Bulbasaur', 'Charmander', 'Squirtle', 'Pidgey', 'Pikachu', 'Nidosaur', 'Mew' ] 
    },
    name: 'Nijikokun'
  }
}));

// This should not pass due to invalid name
route(new system({
  message: 'Test:',
  trainer: {
    backpack: { 
      team: [ 'Bulbasaur' ] 
    },
    name: 'Nijik^kun'
  }
}));

// This should not pass due to missing password
// Missing values are checked first, so they proceed all other checks.
route(new system({
  message: 'Required:',
  trainer: {
    backpack: { 
      team: [ 'Bulbasaur' ] 
    }
  }
}));