const assert = require('assert')
const { createStore } = require('redux')
const covenant = require(process.env.COVENANT_PATH || '../src/covenant')
const {
  secondParties,
  thirdParties,
  anvilProposal,
  anvilUnreconciledProposal,
  anvilInvalidProposal,
  anvilApprove,
  anvilAbandon,
  birdseedProposal,
  birdseedUnreconciledProposal,
  birdseedApprove,
  appleProposal,
  appleApprove,
  appleAbandon
} = require('./inputData')

const { reducer, actions, selectors } = covenant
const {
  initialize,
  propose,
  approve,
  abandon,
  unmatch
} = actions

describe('TEST PROPOSE', function() {
  it('Sets status to RECONCILED for reconciled UDO instance data between 2 parties', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilProposal))
    store.dispatch(propose(birdseedProposal))
    const state = store.getState()
    assert.deepEqual(state.status, "AUTO_RECONCILED")
  })
  it('Sets status to RECONCILED for reconciled UDO instance data between 3 parties.', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(thirdParties))
    store.dispatch(propose(anvilProposal))
    store.dispatch(propose(birdseedProposal))
    store.dispatch(propose(appleProposal))
    const state = store.getState()
    assert.deepEqual(state.status, "AUTO_RECONCILED")
  })
  it('Sets status to PENDING when only one party has submitted UDO Instance', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilProposal))
    const state = store.getState()
    assert.deepEqual(state.status, "PENDING")
  })
  it('Sets status to PENDING when only 2/3 parties have submitted UDO Instance', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(thirdParties))
    store.dispatch(propose(anvilProposal))
    store.dispatch(propose(birdseedProposal))
    const state = store.getState()
    assert.deepEqual(state.status, "PENDING")
  })
  it('Sets status to UNRECONCILED for unreconciled UDO instance data between parties', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    const state = store.getState()
    assert.deepEqual(state.status, "UNRECONCILED")
  })
  it('Sets status to UNRECONCILED for unreconciled UDO instance data between parties when 2/3 parties agree', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(thirdParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedUnreconciledProposal))
    store.dispatch(propose(appleProposal))
    const state = store.getState()
    assert.deepEqual(state.status, "UNRECONCILED")
  })
  it('Sets status to INVALID when 1/2 parties have submitted invalid data', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilInvalidProposal))
    store.dispatch(propose(birdseedProposal))
    const state = store.getState()
    assert.deepEqual(state.status, "INVALID")
  })
  it('Adds unreconciled properties to the unreconciled state slice for the appropriate parties', function() {
    const unreconciled = {
      properties:{
        birdseed: {
          anvil: [ 'weightKgs' ]
        }
      }
    }
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    const state = store.getState()
    assert.deepEqual(state.unreconciled, unreconciled)
  })
  it('Removes data properties that are now reconciled from the unreconciled state slice', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    store.dispatch(propose(anvilProposal))
    const state = store.getState()
    assert.deepEqual(state.unreconciled, {})
  })
  it('Appends UDO Instance data with the correct version number to the correct party', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilProposal))
    store.dispatch(propose(birdseedProposal))
    const state = store.getState()
    assert.deepEqual(state.versions, 2)
  })
  it('Ignored UDO Instance data if party is not an expected party', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilProposal))
    const stateA = store.getState()
    store.dispatch(propose(appleProposal))
    const stateB = store.getState()
    assert.deepEqual(stateA, stateB)
  })
  it("Does nothing if status is IRRECONCILABLE", function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(abandon(anvilAbandon))
    const stateA = store.getState()
    store.dispatch(propose(birdseedProposal))
    const stateB = store.getState()
    assert.deepEqual(stateA, stateB)
  })
})
describe('TEST APPROVE', function() {
  it("Inserts the latest UDO Instance Data again into party's data as newest version with action timestamp", function() {
    const result = [
      {
        version: 1,
        timestamp: '2018-01-01 00:00:00',
        comments: 'anvil unreconciled proposal',
        data: { 
          serialNumber: '1234567890', 
          "material": {
            "materialQuality": 2,
            "materialType": "steel"
          }
        } 
      },
      { 
        version: 3,
        timestamp: '2018-02-01 00:00:00',
        comments: 'anvil approve',
        data: { 
          serialNumber: '1234567890', 
          "material": {
            "materialQuality": 2,
            "materialType": "steel"
          }
        }
      } 
    ]
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    store.dispatch(approve(anvilApprove))
    const state = store.getState()
    assert.deepEqual(state.parties.anvil, result)
  })
  it('Sets status to USER_RECONCILED if all parties agree', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedUnreconciledProposal))
    store.dispatch(approve(anvilApprove))
    store.dispatch(approve(birdseedApprove))
    const state = store.getState()
    assert.deepEqual(state.status, "USER_RECONCILED")
  })
  it('Adds unreconciled properties to the unreconciled state slice for the appropriate parties', function() {
    const result = { properties: { anvil: { birdseed: [ 'reasonForPurchase' ] } } }
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedUnreconciledProposal))
    store.dispatch(approve(anvilApprove))
    const state = store.getState()
    assert.deepEqual(state.unreconciled, result)
  })
  it("Removes data properties that are now reconciled from the unreconciled state slice", function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedUnreconciledProposal))
    store.dispatch(approve(anvilApprove))
    store.dispatch(approve(birdseedApprove))
    const state = store.getState()
    assert.deepEqual(state.unreconciled, {})
  })
  it('Does nothing if the party named by partyName is not an expected party', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedUnreconciledProposal))
    store.dispatch(approve(anvilApprove))
    const stateA = store.getState()
    store.dispatch(approve(appleApprove))
    const stateB = store.getState()
    assert.deepEqual(stateA, stateB)
  })
  it('Does nothing if status is INVALID', function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilInvalidProposal))
    store.dispatch(propose(birdseedProposal))
    const stateA = store.getState()
    store.dispatch(approve(anvilApprove))
    const stateB = store.getState()
    assert.deepEqual(stateA, stateB)
  })
  it("Does nothing if status is IRRECONCILABLE", function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    const stateA = store.getState()
    store.dispatch(approve(appleApprove))
    const stateB = store.getState()
    assert.deepEqual(stateA, stateB)
  })
})
describe('TEST ABANDON', function() {
  it("Sets status to IRRECONCILABLE && Sets unreconciled.reason to the action payload", function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    store.dispatch(abandon(anvilAbandon))
    const state = store.getState()
    assert.deepEqual(state.status, "IRRECONCILABLE")
    assert.deepEqual(state.unreconciled.reason, anvilAbandon.reason)
  })
  it("Does nothing if the party named by partyName is not an expected party", function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    const stateA = store.getState()
    store.dispatch(abandon(appleAbandon))
    const stateB = store.getState()
    assert.deepEqual(stateA, stateB)
  })
})
describe('TEST UNMATCH', function() {
  it("Does nothing if any party has more than one UDO Instance data", function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    store.dispatch(propose(anvilProposal))
    const stateA = store.getState()
    store.dispatch(unmatch())
    const stateB = store.getState()
    assert.deepEqual(stateA, stateB)
  })
  it("Does nothing if status is IRRECONCILABLE", function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    store.dispatch(abandon(anvilAbandon))
    const stateA = store.getState()
    store.dispatch(unmatch())
    const stateB = store.getState()
    assert.deepEqual(stateA, stateB)
  })
  it("Sends a RESUBMIT_UDO_DATA action to the UDO Instance Manager & destroys itself", function() {
    let store = createStore(reducer)
    store.dispatch(propose(anvilUnreconciledProposal))
    store.dispatch(propose(birdseedProposal))
    store.dispatch(unmatch())
    const state = store.getState()
    assert.deepEqual(state, {})
  })
})
describe('TEST SELECTORS', function() {
  it("Gets the status for this UDO instance", function() {
    let store = createStore(reducer)
    store.dispatch(initialize(secondParties))
    store.dispatch(propose(anvilProposal))
    store.dispatch(propose(birdseedProposal))
    const state = store.getState()
    status = selectors.getStatus(state)
    assert.deepEqual(status, "AUTO_RECONCILED")
  })
})
