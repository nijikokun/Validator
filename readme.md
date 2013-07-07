# Validator JS

Barebones schema validation library for things such as database schemas, api data schemas, etc.

### Extensions

- Requirement (built-in)
- Length - By itself it must be this long, otherwise as an object supports the following:
  - Min
  - Max
- Match (Regular expression tests)
  - Supports an array of RegExps as well.

### Todo

- Make extensibility easier.
- Move over to github repository.

### Changelog

Version 2
 - Fix slight bugs in matching validation check
 - Make errors Object based for quick key referencing

Version 1
 - Initial Release.