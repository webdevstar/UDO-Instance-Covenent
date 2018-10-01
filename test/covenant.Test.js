const assert = require('assert')
const fs = require('fs')
const path = require('path')
const covenant = require(process.env.COVENANT_PATH || '../src/covenant')
const { createHarness } = require('./harness')
const interbitActions = require('./harness/interbitReducer/actions')
const createSagaRunner = require('./harness/sagaRunner')
const deferred = require('./harness/common/deferred')

describe('test covenant', function() {
  beforeEach(function() {
    this.harness = createHarness(covenant)
  })
  afterEach(function() {
    delete this.harness
  })
  it('boots up', function() {
    this.harness.dispatch(interbitActions.hypervisorBoot())
    this.harness.block()

    assert.strict.equal(this.harness.getState().bootHypervisorReceived, true)
  })
  it('shuts down', function() {
    this.harness.dispatch(interbitActions.hypervisorShutdown())
    this.harness.block()
    assert.strict.equal(
      this.harness.getState().shutdownHypervisorReceived,
      true
    )
  })
  it('checks if a letter is in a list', async function() {
    this.harness.dispatch(covenant.actions.checkInAlphabet('a'))
    this.harness.block()
    await this.harness.waitForPool()
    this.harness.block()

    const responseAction = this.harness.findActionInLastBlock(
      covenant.actions.checkInAlphabetResponse().type
    )
    assert.strict.equal(responseAction.payload.isInAlphabet, true)
  })
})

const dummyContext = () => ({
  getAlphabet: () => [1, 2, 3, 4]
})
const dummyWorker = {
  checkInAlphabet: (value, context) => {
    return context.getAlphabet().includes(value)
  }
}
const dummy = {
  createContext: dummyContext,
  worker: dummyWorker
}

describe('test covenant components', function() {
  it('tests the saga', async function() {
    const { rootSaga, actions } = covenant
    const _deferred = deferred()
    const runner = createSagaRunner(rootSaga, _deferred.resolve, dummy)
    runner.run({
      state: {},
      actions: [actions.checkInAlphabetSaga(1)]
    })
    const action = await _deferred.promise
    assert.strict.equal(action.type, actions.checkInAlphabetSagaResponse().type)
    assert.strict.equal(action.payload.isInAlphabet, true)
  })
  it('tests the worker', async function() {
    const { worker } = covenant.sagaDefault
    const dummyContext = dummy.createContext()
    const isInAlphabet = await worker.checkInAlphabet(1, dummyContext)
    assert(isInAlphabet)
  })
  it('tests the context', function() {
    const { createContext } = covenant.sagaDefault
    const context = createContext()
    const alphabet = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../', 'src', 'alphabet.json'),
        'utf8'
      )
    )
    assert.strict.deepEqual(alphabet, context.getAlphabet())
  })
  it('tests the reducer', function() {
    const { reducer, actions } = covenant

    const initialState = reducer(undefined, { type: 'WHATEVER' })
    assert.strict.deepEqual(initialState.blacklist, ['b', 'd'])

    const newBlacklist = ['a']
    const updateBlacklistAction = actions.updateBlacklist(newBlacklist)
    const updatedBlacklistState = reducer(initialState, updateBlacklistAction)
    assert.strict.deepEqual(updatedBlacklistState.blacklist, newBlacklist)
  })
})
