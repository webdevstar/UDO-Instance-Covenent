# Job_IUPW-W013


## Purpose

The purpose of this job is to develop an Interbit
[covenant](docs/covenant.md) such that:

1. The covenant object fully implements the interface described in the
   [specification](SPEC.md).

2. The correctness of the covenant's features is demonstrated by
   providing all of the required tests within the
   [specification](SPEC.md).

   - The test code must be written using the provided
     [test harness](docs/harness.md). See the [installation
     instructions](docs/README.md).


## File locations

* Covenant code should be placed in the `src/` directory.

* Test code and fixtures should be placed in the `test/` directory,
  beside the harness.

Example files are provided in both locations. Make sure that you change
the package name in `package.json` before you start.


## Summary

The covenant you are undertaking to write is part of a reconciliation
process. The reconciliation process involves multiple parties that
define their own data objects with a schema. The parties that submit
data to the covenant must come to an agreement on the state of the data
by dispatching `UPDATE_UDO` actions until the data matches
reconciliation criteria defined by the schema.


## Notes

Two sample schemas have been provided in the `src/schema` directory. To
get a schema by type, call the `getSchema(schemaType)` function using
the type you wish to retrieve.

We have defined our schemas using the [draft-07 JSON Schema
Spec](https://json-schema.org/). There is a validation library that
works with this schema. In addition to this, another helpful packages
has been outlined below. If you have preferred packages you wish to use
instead of these, they must be as lightweight as possible.

Package | Reason
--------|-------
json-stable-stringify | Used to deterministically sort arrays and JSON keys so they can be matched correctly
ajv | "Another JSON Schema Validator" Validates the UDO Schema format used in the sample


## Covenant

A covenant consists of the following pieces:

```js
{
  actions: {} // action creator functions, e.g. (...args) => ({ type: ACTION, payload: { /* data */ }}),
  reducer: (state, action) => nextState, // reducer that responds to the actions created action creator functions
  rootSaga: function*() {}, // a generator function that responds to actions created by action creator functions
  selectors: (state) => derivedValues, // a function that picks required derived values out of the state
}
```

Together these form an interface to an object that has state managed by
a reducer, and impure behaviour contained in the `rootSaga`. Selectors are
included to allow the developer freedom to implement the state however
they choose.


## Harness interface

This harness must be booted with a covenant, and provides several useful
interface functions for writing tests

* `dispatch :: Action -> ()` - Adds an action to the action pool. This
  does not do anything until a block is made.

* `subscribe :: Callback -> ()` - Adds a subscription function to the
  running instance. This function is called every time a block is made

* `getState :: () -> State` - Retrieves the currently-bound state of the
  covenant.

* `getBlocks :: () -> Blocks` - Retrieves the current list of blocks.

* `block` :: `() -> ()` - Creates a block and binds it and the resulting
  state to the `blocks` and `state` bindings.

See the [How the test harness works](docs/harness.md) for details.
