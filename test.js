// Developed By Nijiko Yonskai
// JSON Schema Validator for API w/ a middleware for express
// Copyright 2013

var assert = require('assert')
var Validator = require('./validator')
var validator

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
    type: 'String',
    required: true,
    length: {
      min: 3,
      max: 36
    },
    test: /^[a-z0-9]+$/i
  },

  password: {
    type: 'String'
  }
}

// Initialize validator
validator = new Validator(schema)
validator.debug = true

// Testing defaults and Empty String
assert(validator.check({
  backpack: {
    team: [ 'Bulbasaur' ]
  },

  name: 'Nijikokun',
  password: ''
})._error == null)

// This should not pass due to invalid identifier (just to show number length
// yadda yadda)
assert(validator.check({
  backpack: {
    team: [
      'Bulbasaur',
      'Charmander',
      'Squirtle',
      'Pidgey',
      'Pikachu',
      'Nidosaur',
      'Mew'
    ]
  },
  name: 'Nijikokun',
  password: ''
})._error === true)

// This should not pass due to invalid name
assert(validator.check({
  backpack: {
    team: [ 'Bulbasaur' ]
  },

  name: 'Nijik^kun',
  password: '123456'
})._error === true)

// This should not pass due to missing username
// Missing values are checked first, so they proceed all other checks.
assert(validator.check({
  backpack: {
    team: [ 'Bulbasaur' ]
  },
  password: '123456'
})._error === true)
