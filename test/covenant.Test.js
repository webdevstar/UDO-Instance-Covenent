const assert = require('assert')
const fs = require('fs')
const path = require('path')
const covenant = require(process.env.COVENANT_PATH || '../src/covenant')
const { createHarness } = require('./harness')
const interbitActions = require('./harness/interbitReducer/actions')
const createSagaRunner = require('./harness/sagaRunner')
const deferred = require('./harness/common/deferred')

const { reducer, actions } = covenant

let initializeState
let initializeThirdState

const anvilNewProposal = {
  partyName: 'anvil',
  timestamp: '2018-01-01 00:00:00',
  comments: 'anvil new proposal',
  udoData: {
    "serialNumber": "1234567890",
    "weightKgs": 1,
    "material": {
      "materialQuality": 2,
      "materialType": "steel"
    }
  }
}
const birdseedNewProposal = {
  partyName: 'birdseed',
  timestamp: '2018-01-01 00:00:00',
  comments: 'birdseed new proposal',
  udoData: {
    "reasonForPurchase": "ABCDEFGHIJKL"
  }
}
const partyANewProposal = {
  partyName: 'partyA',
  timestamp: '2018-01-01 00:00:00',
  comments: 'partyA new proposal',
  udoData: {
    "aaa": "ABCDEFGHIJKL",
    "bbb": "ABCDEFGHIJKL",
    "ccc": [1,"a","Street", [1,2], {person: {name: "Alex", age: 23}}, 3],
    "ddd": {
      name: "alex",
      gender: "male",
      age: 23,
      cnt: 1
    },
    "eee":{
      eeeA: "ABC",
      eeeB: 23
    }
  }
}

const anvilUnreconciledProposal = {
  partyName: 'anvil',
  timestamp: '2018-01-01 00:00:00',
  comments: 'anvil new proposal',
  udoData: {
    "serialNumber": "1234567890",
    "material": {
      "materialQuality": 2,
      "materialType": "steel"
    }
  }
}
const birdseedUnreconciledProposal = {
  partyName: 'birdseed',
  timestamp: '2018-01-01 00:00:00',
  comments: 'birdseed new proposal',
  udoData: {}
}

const anvilApprove = {
  partyName: 'anvil',
  timestamp: '2018-02-01 00:00:00',
  comments: 'anvil approve',
}
const birdseedApprove = {
  partyName: 'birdseed',
  timestamp: '2018-02-01 00:00:00',
  comments: 'birdseed approve',
}
const ignoreApprove = {
  partyName: 'ignore',
  timestamp: '2018-02-01 00:00:00',
  comments: 'ignore approve',
}
const anvilAbandon = {
  partyName: 'anvil',
  reason: 'This UDO Instance cannot be reconciled'
}
const ignoreAbandon = {
  partyName: 'ignore',
  reason: 'This UDO Instance cannot be reconciled'
}

const anvilInvalidProposal = {
  partyName: 'anvil',
  timestamp: '2018-01-01 00:00:00',
  comments: 'anvil new proposal',
  udoData: {
    "serialNumber": "1234567890",
    "weightKgs": "a",
    "material": {
      "materialQuality": 2,
      "materialType": "steel"
    }
  }
}
const ignoreProposal = {
  partyName: 'ignore',
  timestamp: '2018-01-01 00:00:00',
  comments: 'ignore new proposal',
  udoData: {
    "serialNumber": "1234567890",
    "weightKgs": "a",
    "material": {
      "materialQuality": 2,
      "materialType": "steel"
    }
  }
}

describe('TEST INITIALIZE', function() {
  
  it('test INITIALIZE', function() {

    const { reducer, actions } = covenant

    const resultState = {
      parties: {
        anvil: [],
        birdseed: []
      },
      expectedParties: ["anvil", "birdseed"],
      status: 'PENDING',
      unreconciled: {},
      versions: 0,
    }

    const initialState = reducer(undefined, { type: 'WHATEVER' })

    const initial = ["anvil", "birdseed"]
    const initializeAction = actions.initialize(initial)
    initializeState = reducer(initialState, initializeAction)

    const initialThird = ["anvil", "birdseed", "partyA"]
    const initializeThirdAction = actions.initialize(initialThird)
    initializeThirdState = reducer(initialState, initializeThirdAction)

    assert.deepEqual(resultState, initializeState)

  })

})

describe('TEST PROPOSE', function() {

  it('Sets status to RECONCILED for reconciled UDO instance data between 2 parties', function() {

    const anvilProposeAction = actions.propose(anvilNewProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    assert.deepEqual(birdseedProposeState.status, "AUTO_RECONCILED")

  })

  it('Sets status to RECONCILED for reconciled UDO instance data between 3 parties.', function() {

    const anvilProposeAction = actions.propose(anvilNewProposal)
    const anvilProposeState = reducer(initializeThirdState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const partyAProposeAction = actions.propose(partyANewProposal)
    const partyAProposeState = reducer(birdseedProposeState, partyAProposeAction)

    assert.deepEqual(partyAProposeState.status, "AUTO_RECONCILED")

  })

  it('Sets status to PENDING when only one party has submitted UDO Instance', function() {

    const proposeAction = actions.propose(anvilNewProposal)
    const proposeState = reducer(initializeState, proposeAction) 

    assert.deepEqual(proposeState.status, "PENDING")

  })

  it('Sets status to PENDING when only 2/3 parties have submitted UDO Instance', function() {

    const anvilProposeAction = actions.propose(anvilInvalidProposal)
    const anvilProposeState = reducer(initializeThirdState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    assert.deepEqual(birdseedProposeState.status, "PENDING")

  })

  it('Sets status to UNRECONCILED for unreconciled UDO instance data between parties', function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    assert.deepEqual(birdseedProposeState.status, "UNRECONCILED")

  })

  it('Sets status to UNRECONCILED for unreconciled UDO instance data between parties when 2/3 parties agree', function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeThirdState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedUnreconciledProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const partyAProposeAction = actions.propose(partyANewProposal)
    const partyAProposeState = reducer(birdseedProposeState, partyAProposeAction)

    assert.deepEqual(partyAProposeState.status, "UNRECONCILED")

  })

  it('Sets status to INVALID when 1/2 parties have submitted invalid data', function() {

    const anvilProposeAction = actions.propose(anvilInvalidProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    assert.deepEqual(birdseedProposeState.status, "INVALID")

  })

  it('Adds unreconciled properties to the unreconciled state slice for the appropriate parties', function() {

    const resultState = {
      properties:{
        birdseed: {
          anvil: [ 'weightKgs' ]
        }
      }
    }

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    assert.deepEqual(birdseedProposeState.unreconciled, resultState)

  })

  it('Removes data properties that are now reconciled from the unreconciled state slice', function() {

    const resultState = {}

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const anvilProposeNewAction = actions.propose(anvilNewProposal)
    const anvilProposeNewState = reducer(birdseedProposeState, anvilProposeNewAction)

    assert.deepEqual(anvilProposeNewState.unreconciled, resultState)

  })

  it('Appends UDO Instance data with the correct version number to the correct party', function() {

    const anvilProposeAction = actions.propose(anvilNewProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    assert.deepEqual(birdseedProposeState.versions, 2)

  })

  it('Ignored UDO Instance data if party is not an expected party', function() {

    const ignoreProposeAction = actions.propose(ignoreProposal)
    const ignoreProposeState = reducer(initializeState, ignoreProposeAction)

    assert.deepEqual(ignoreProposeState, undefined)

  })

  it("Does nothing if status is IRRECONCILABLE", function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const anvilAbandonAction = actions.abandon(anvilAbandon)
    const anvilAbandonState = reducer(anvilProposeState, anvilAbandonAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilAbandonState, birdseedProposeAction)

    assert.deepEqual(birdseedProposeState, undefined)

  })

})

describe('TEST APPROVE', function() {

  it("Inserts the latest UDO Instance Data again into party's data as newest version with action timestamp", function() {

    const result = [
      {
        version: 1,
        timestamp: '2018-01-01 00:00:00',
        comments: 'anvil new proposal',
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

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const anvilApproveAction = actions.approve(anvilApprove)
    const anvilApproveState = reducer(birdseedProposeState, anvilApproveAction)

    assert.deepEqual(anvilApproveState.parties.anvil, result)

  })

  it('Sets status to USER_RECONCILED if all parties agree', function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedUnreconciledProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const anvilApproveAction = actions.approve(anvilApprove)
    const anvilApproveState = reducer(birdseedProposeState, anvilApproveAction)

    const birdseedApproveAction = actions.approve(birdseedApprove)
    const birdseedApproveState = reducer(anvilApproveState, birdseedApproveAction)
    
    assert.deepEqual(birdseedApproveState.status, "USER_RECONCILED")

  })

  it('Adds unreconciled properties to the unreconciled state slice for the appropriate parties', function() {

    const result = { properties: { anvil: { birdseed: [ 'reasonForPurchase' ] } } }

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedUnreconciledProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const anvilApproveAction = actions.approve(anvilApprove)
    const anvilApproveState = reducer(birdseedProposeState, anvilApproveAction)
    
    assert.deepEqual(anvilApproveState.unreconciled, result)

  })

  it("Removes data properties that are now reconciled from the unreconciled state slice", function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const anvilApproveAction = actions.approve(anvilApprove)
    const anvilApproveState = reducer(birdseedProposeState, anvilApproveAction)

    assert.deepEqual(anvilApproveState.unreconciled, {})

  })

  it('Does nothing if the party named by partyName is not an expected party', function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const ignoreProposeAction = actions.approve(ignoreApprove)
    const ignoreProposeState = reducer(birdseedProposeState, ignoreProposeAction)

    assert.deepEqual(ignoreProposeState, undefined)

  })

  it('Does nothing if status is INVALID', function() {

    const anvilProposeAction = actions.propose(anvilInvalidProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const ignoreProposeAction = actions.approve(ignoreApprove)
    const ignoreProposeState = reducer(birdseedProposeState, ignoreProposeAction)

    assert.deepEqual(ignoreProposeState, undefined)

  })

  it("Does nothing if status is IRRECONCILABLE", function() {

    const anvilProposeAction = actions.propose(anvilInvalidProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const anvilAbandonAction = actions.abandon(anvilAbandon)
    const anvilAbandonState = reducer(birdseedProposeState, anvilAbandonAction)

    const ignoreProposeAction = actions.approve(ignoreApprove)
    const ignoreProposeState = reducer(anvilAbandonState, ignoreProposeAction)

    assert.deepEqual(ignoreProposeState, undefined)

  })

})

describe('TEST ABANDON', function() {

  it("Sets status to IRRECONCILABLE && Sets unreconciled.reason to the action payload", function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const anvilAbandonAction = actions.abandon(anvilAbandon)
    const anvilAbandonState = reducer(birdseedProposeState, anvilAbandonAction)

    assert.deepEqual(anvilAbandonState.status, "IRRECONCILABLE")
    assert.deepEqual(anvilAbandonState.unreconciled.reason, anvilAbandon.reason)

  })

  it("Does nothing if the party named by partyName is not an expected party", function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const ignoreAbandonAction = actions.abandon(ignoreAbandon)
    const ignoreAbandonState = reducer(birdseedProposeState, ignoreAbandonAction)

    assert.deepEqual(ignoreAbandonState, undefined)

  })

})

describe('TEST UNMATCH', function() {

  it("Does nothing if any party has more than one UDO Instance data", function() {

    const anvilProposeAction = actions.propose(anvilNewProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const unmatchAction = actions.unmatch()
    const unmatchState = reducer(birdseedProposeState, unmatchAction)

    assert.deepEqual(unmatchState, undefined)
  })

  it("Does nothing if status is IRRECONCILABLE", function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    const anvilAbandonAction = actions.abandon(anvilAbandon)
    const anvilAbandonState = reducer(birdseedProposeState, anvilAbandonAction)

    const unmatchAction = actions.unmatch()
    const unmatchState = reducer(anvilAbandonState, unmatchAction)

    assert.deepEqual(unmatchState, undefined)
  })

})
