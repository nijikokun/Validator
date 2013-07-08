# Validator JS

Barebones schema validation library for things such as database schemas, api data schemas, etc.

### Extensions

- Requirement (built-in)
- Type - uses `Object.prototype.toString.call` so make sure you use `String`, `Number`, `Boolean`... etc.
- Length - By itself it must be this long, otherwise as an object supports the following:
  - Min
  - Max
- Test (Regular expression tests)
  - Supports an array of RegExps as well.

#### Creating an extension

Implementing a feature into Validator is easy, you set the field and a callback, the callback gives you three items of data `details` (the whole schema, and your field is included so you can do cross checks if needed), `key` (the name of the parameter), `data` (retrieved parameter data from external source, you check against this).

```javascript
Validator.implement("field", function (details, key, data) {
  this.error(key, "error-field", "No check has been done against this key!");
});
```

After your implementation has been ran, the validator will check for errors, if found it will exit out and return the errors. You can pass along multiple errors per run, for an example check the test implementation.

### Todo

- <s>Make extensibility easier.</s>
- Move over to github repository.

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