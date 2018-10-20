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

const anvilNewProposal = {

  partyName: 'anvil',
  timestamp: '2018-01-01 00:00:00',
  comments: 'anvil new proposal',
  udoData: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://interbit.io/anvil.schema.json",
    "title": "Anvil",
    "description": "An ACME products Anvil order specfication",
    "properties": {
      "serialNumber": "1234567890",
      "weightKgs": 1,
      "material": {
        "materialQuality": 2,
        "materialType": "steel"
      }
    },
  }

}
const birdseedNewProposal = {

  partyName: 'birdseed',
  timestamp: '2018-01-01 00:00:00',
  comments: 'birdseed new proposal',
  udoData: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://interbit.io/birdseed.schema.json",
    "title": "Bird Seed",
    "description": "An ACME products 10kg pile of bird seed",
    "properties": {
      "reasonForPurchase": "ABCDEFGHIJKL"
    },
  }

}
const anvilUnreconciledProposal = {

  partyName: 'anvil',
  timestamp: '2018-01-01 00:00:00',
  comments: 'anvil new proposal',
  udoData: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://interbit.io/anvil.schema.json",
    "title": "Anvil",
    "description": "An ACME products Anvil order specfication",
    "properties": {
      "serialNumber": "1234567890",
      "material": {
        "materialQuality": 2,
        "materialType": "steel"
      }
    },
  }

}
const anvilInvalidProposal = {

  partyName: 'anvil',
  timestamp: '2018-01-01 00:00:00',
  comments: 'anvil new proposal',
  udoData: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://interbit.io/anvil.schema.json",
    "title": "Anvil",
    "description": "An ACME products Anvil order specfication",
    "properties": {
      "serialNumber": "123456",
      "weightKgs": 1,
      "material": {
        "materialQuality": 2,
        "materialType": "steel"
      }
    },
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
    assert.deepEqual(resultState, initializeState)

  })

})

describe('TEST PROPOSE', function() {

  it('Sets status to RECONCILED for reconciled UDO instance data between 2 parties', function() {

    const anvilProposeAction = actions.propose(anvilNewProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    console.log("status: "+birdseedProposeState.status)
    assert.deepEqual(birdseedProposeState.status, "AUTO_RECONCILED")

  })

  it('Sets status to PENDING when only one party has submitted UDO Instance', function() {

    const proposeAction = actions.propose(anvilNewProposal)
    const proposeState = reducer(initializeState, proposeAction) 

    console.log("status: "+proposeState.status)
    assert.deepEqual(proposeState.status, "PENDING")

  })

  it('Sets status to UNRECONCILED for unreconciled UDO instance data between parties', function() {

    const anvilProposeAction = actions.propose(anvilUnreconciledProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    console.log("status: "+birdseedProposeState.status)
    console.log("unreconciled: "+birdseedProposeState.unreconciled.properties)
    assert.deepEqual(birdseedProposeState.status, "UNRECONCILED")

  })

  it('Sets status to INVALID when 1/2 parties have submitted invalid data', function() {

    const anvilProposeAction = actions.propose(anvilInvalidProposal)
    const anvilProposeState = reducer(initializeState, anvilProposeAction)

    const birdseedProposeAction = actions.propose(birdseedNewProposal)
    const birdseedProposeState = reducer(anvilProposeState, birdseedProposeAction)

    console.log("status: "+birdseedProposeState.status)
    assert.deepEqual(birdseedProposeState.status, "INVALID")

  })

})
