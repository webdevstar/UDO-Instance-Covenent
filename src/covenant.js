const Immutable = require('seamless-immutable')
const { takeEvery, put, all } = require('redux-saga/effects')
const fs = require('fs')
const path = require('path')
const { interbitTypes, redispatch } = require('../test/harness')

const types = {
  CHECK_IN_ALPHABET: 'CHECK_IN_ALPHABET',
  CHECK_IN_ALPHABET_RESPONSE: 'CHECK_IN_ALPHABET/response',
  UPDATE_BLACKLIST: 'UPDATE_BLACKLIST',
  CHECK_IN_ALPHABET_SAGA: 'CHECK_IN_ALPHABET_SAGA',
  CHECK_IN_ALPHABET_SAGA_RESPONSE: 'CHECK_IN_ALPHABET_SAGA/response'
}
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

const initialState = Immutable.from({
  blacklist: ['b', 'd'],
  config: {
    alphabetLocation: 'alphabet.json'
  }
})
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

let instance
const createContext = () => {
  if (instance) {
    return instance
  }
  const contents = fs.readFileSync(
    path.join(__dirname, 'alphabet.json'),
    'utf8'
  )
  const alphabet = JSON.parse(contents)
  const getAlphabet = () => alphabet
  instance = {
    getAlphabet
  }
  return instance
}

const worker = {
  checkInAlphabet: async (value, context) => {
    const alphabet = context.getAlphabet()
    return alphabet.includes(value)
  }
}
const sagaDefault = {
  createContext,
  worker
}

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

const covenant = {
  sagaDefault,
  actions,
  reducer,
  rootSaga
}

module.exports = covenant
