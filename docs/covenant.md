# Covenant

An Interbit covenant describes the code and configuration that manages
the evolution of a state (a key->value dictionary of arbitrary
composition). When updates are to be made to the state, the covenant
defines how those changes are to be made.

> Note: The repo contains a working version of the code samples provided
> below.


## Composition

A covenant is a Javascript comprised of the following elements:

```js
{
  actions: {},
  reducer: (state, action) => nextState,
  rootSaga: function*() {},
  selectors: {}
}
```

Together, these form an interface to an object that has state managed by
a `reducer`, and impure behavior contained within the `rootSaga`
generator function.


### `actions`

A collection of action creator functions. Each action creator function
has the signature:

```js
(...args) => ({ type: ACTION, payload: { /* data */ } })
```

For example:

```js
const actions = {
  checkInAlphabet: value => ({
    type: types.CHECK_IN_ALPHABET,
    payload: { value }
  }),
  checkInAlphabetResponse: isInAlphabet => ({
    type: types.CHECK_IN_ALPHABET_RESPONSE,
    payload: { isInAlphabet }
  }),
  checkInAlphabetSaga: value => ({
    type: types.CHECK_IN_ALPHABET_SAGA,
    payload: { value }
  }),
  checkInAlphabetSagaResponse: isInAlphabet => ({
    type: types.CHECK_IN_ALPHABET_SAGA_RESPONSE,
    payload: { isInAlphabet }
  }),
  updateBlacklist: newBlacklist => ({
    type: types.UPDATE_BLACKLIST,
    payload: { newBlacklist }
  })
}
```

Since the `reducer` responds to these actions, it is best practice to
declare the action types separately:

```js
const types = {
  CHECK_IN_ALPHABET: 'CHECK_IN_ALPHABET',
  CHECK_IN_ALPHABET_RESPONSE: 'CHECK_IN_ALPHABET/response',
  UPDATE_BLACKLIST: 'UPDATE_BLACKLIST',
  CHECK_IN_ALPHABET_SAGA: 'CHECK_IN_ALPHABET_SAGA',
  CHECK_IN_ALPHABET_SAGA_RESPONSE: 'CHECK_IN_ALPHABET_SAGA/response'
}
```


### `reducer`

A pure function that responds to the `actions`.

```js
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CHECK_IN_ALPHABET: {
      const { value } = action.payload
      if (state.blacklist.includes(value)) {
        return state
      }
      return redispatch(state, [actions.checkInAlphabetSaga(value)])
    }
    case types.CHECK_IN_ALPHABET_SAGA_RESPONSE: {
      const { isInAlphabet } = action.payload
      return redispatch(state, [actions.checkInAlphabetResponse(isInAlphabet)])
    }
    case types.UPDATE_BLACKLIST: {
      const { newBlacklist } = action.payload
      return state.set('blacklist', newBlacklist)
    }
    case interbitTypes.HYPERVISOR_BOOT: {
      return state.set('bootHypervisorReceived', true)
    }
    case interbitTypes.HYPERVISOR_SHUTDOWN: {
      return state.set('shutdownHypervisorReceived', true)
    }
    default:
      return state
  }
}
```


### `rootSaga`

A `redux-saga`-compatible generator function that isolates all impure
behavior required. A `rootSaga` would be used to coordinate any side
effects, and could be used to dispatch additional actions.

> **Important**: A saga should only implement private behavior for its
> covenant. Therefore, sagas should only listen to actions redispatched
> by the reducer. In effect, only the reducer can "talk" to the saga.

```js
function* rootSaga({ createContext, worker } = sagaDefault) {
  const context = createContext()
  yield all([
    takeEvery(types.CHECK_IN_ALPHABET_SAGA, function*(action) {
      const { value } = action.payload
      const isInAlphabet = yield worker.checkInAlphabet(value, context)
      yield put(actions.checkInAlphabetSagaResponse(isInAlphabet))
    })
  ])
}
```


### `selectors`

A collection of functions that extracts derived values out of the
state. These functions permit you to implement the state in any way
that you choose.

The test harness currently doesn't implement any example selectors.
You need to implement your own, as their implementation is based on the
shape of your state data structure.
