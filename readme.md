# Validator JS

Barebones schema validation library for things such as database schemas, api data schemas, etc.

### Install

```bash
$ npm install schema-validator
```

For browsers, download and include the script `validator.js` just as you would jquery or another script.

### Implementations

- Requirement (built-in)
- Type - uses `Object.prototype.toString.call` so make sure you use `String`, `Number`, `Boolean`... etc.
- Length - By itself it must be this long, otherwise as an object supports the following:
  - Min
  - Max
- Test (Regular expression tests)
  - Supports an array of RegExps as well.

#### Usage

You create a JSON Schema, where `username` is a field, and each key:value inside of it is an implementation in validator.

```javascript
var schema = {
  username: {
    type: "String",
    required: true,
    length: {
      min: 3,
      max: 36
    },
    test: /^[a-z0-9]+$/gi
  }
};
```

Setup a `new Validator` against your schema:

```javascript
var validator = new Validator(schema);
```

Now we validate against some given information:

```javascript
var check = validator.check({
  username: "Niji%kokun"
});

console.log(check);
```

##### Express Middleware Style:

Schema data will be put on the request object, `req.validated`, as an `Object` containing field : data information.

```javascript
app.get('api/user/add', [ new Validator(schema.user, true) ], function (req, res) {
  res.send(200, req.validated);
});
```

or

```javascript
app.get('api/user/add', [ (new Validator(schema.user)).middleware ], function (req, res) {
  res.send(200, req.validated);
});
```

#### Creating an extension

Implementing a feature into Validator is easy, you set the field and a callback.

The callback supports a single argument `options` which contains valuable information.
  - `field` - The field implementation that is being checked.
  - `key` - The schema field being checked.
  - `data` - The data passed from an external source.
  - `value` - The field implementation data value.
  - `error` - Sugar method for `this.error` which was previously used.
    - `type` - optional argument, it's the error field for the message given. Default is `field`.
    - `message` - Error message.

```javascript
Validator.implement("field", function (options) {
  if (options.data) {
    options.error("Data exists, this is wrong... or right! I don't know!");
  }

  // If you couldn't tell this gives an error back to the validator
  options.error("No check has been done against this key!");

  // and you can set custom field name for the error message object
  options.error("error-field", "This field hasn't been checked yet!");
});
```

After your implementation has been ran, the validator will check for errors, if found it will exit out and return the errors. You can pass along multiple errors per run, for an example check the test implementation.

### Todo

- ~~Make extensibility easier.~~
- ~~Move over to github repository.~~
- Make implementations use an object as an argument rather than multiple arguments.
  - Allowing for further expansion / extensibility.

### Changelog

Version 3.1
  - Extended comments
  - Implemented module exporting for various platforms.

Version 3
  - Remove console logging
  - Implement plugin system - `.implement` method

Version 2
 - Fix slight bugs in matching validation check
 - Make errors Object based for quick key referencing

Version 1
 - Initial Release.