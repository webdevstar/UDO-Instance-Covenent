const Immutable = require('seamless-immutable')
const fs = require('fs')
const path = require('path')
const { interbitTypes, redispatch } = require('../test/harness')
const getSchema = require('./schema/getSchema')
const udoValidate = require('./schema/udoValidate')

const types = {
  PROPOSE: 'PROPOSE',
  APPROVE: 'APPROVE',
  ABANDON: 'ABANDON',
  UNMATCH: 'UNMATCH',
  CHECK_STATUS: 'CHECK_STATUS',
  INITIALIZE: 'INITIALIZE'
}
const statusTypes = {
  PENDING: 'PENDING',
  AUTO_RECONCILED: 'AUTO_RECONCILED',
  USER_RECONCILED: 'USER_RECONCILED',
  UNRECONCILED: 'UNRECONCILED',
  IRRECONCILABLE: 'IRRECONCILABLE',
  INVALID: 'INVALID'
}
const actions = {
  initialize: value => ({
    type: types.INITIALIZE,
    payload: value
  }),
  propose: value => (dispath, getState)=> {
    dispath({ type: types.PROPOSE, payload: value})

    const state = getState()

    dispath({ type: types.CHECK_STATUS })
  }
  approve: value => ({
    type: types.APPROVE,
    payload: value
  }),
  abandon: value => ({
    type: types.ABANDON,
    payload: value
  }),
  unmatch: value => ({
    type: types.ABANDON,
    payload: value
  })
}

const initialState = Immutable.from({
  parties: {
  },
  expectedParties: []
  status: 'PENDING',
  versions: 0,
})

const selectors = {
  getUdo: (state) => {
    // Gets the UDO instance.
    return
  },
  getUdoType: (state) => {
    // Gets the UDO Type.
    return
  },
  getUdoId: (state) => {
    // Gets the UDO ID.
    return
  },
  getStatus: (state) => {
    return state.get('status')
  },
  getParties: (state) => {
    return state.get('parties')
  },
  getDataListForParty: (state) => {
    // Gets the data for a specified party in an array.
    return
  },
  getLatestDataForParty: (state) => {
    // Gets the most recent version of the UDO data for the party.
    return
  },
  getLatestPartyData: (state) => {
    // Gets the most recent versions of the UDO data for every party, in an array.
    return
  },
  getExpectedParties: (state) => {
    // Gets the name of each party expected to participate in submitting data for this UDO Instance.
    return
  },
  getUnreconciled: (state) => {
    // Gets the entire set of unreconciled properties.
    return
  },
  getUnreconciledForParties: (state) => {
    // Gets the unreconciled properties between two parties.
    return
  },
  getIrreconcilableReason: (state) => {
    // Gets the reason the UDO Instance is IRRECONCILABLE.
    return
  },
  getIrreconcilableReason: (state) => {
    // Gets the reason the UDO Instance is IRRECONCILABLE.
    return
  },
  isReconciled: (state) => {
    // Indicates whether this UDO instance is reconciled.
    return
  },
  isPending: (state) => {
    // Indicates whether this UDO instance is pending.
    return
  },
  isValid: (state) => {
    // Indicates whether this UDO instance is valid.
    return
  },
  isUnreconciled: (state) => {
    // Indicates whether this UDO instance is reconciled.
    return
  },
  isIrreconcilable: (state) => {
    // Indicates whether this UDO instance is unable to be reconciled.
    return
  },
}

const updateStatus = (state, payload) => {
  let currentStatus
  //pending
  state.expectedParties.forEach((partyName) => {
    if (!state.hasIn(['parties', partyName, 0])) {
      currentStatus = statusTypes.PENDING
    }
  })
  //invalid
  if(!currentStatus){
    const schema = getSchema(action.payload.partyName)
    const udoValidate = udoValidate(payload.data, schema)
    if(!udoValidate){
      currentStatus = statusTypes.INVALID
    }
  }
  else if(!currentStatus || payload.data){
    currentStatus = statusTypes.USER_RECONCILED
  }
  //other status code...
}

const reducer = (state = initialState, action) => {
  switch (action.type) {

    case types.INITIALIZE: {
      const parties;
      action.payload.forEach((key) => parties[key] = [] )
      return state.set('expectedParties', action.payload).set('parties', parties)
    }

    case types.PROPOSE: {
      const payload = {
        version: state.get('versions') + 1,
        timestamp: action.payload.timestamp,
        comments: action.payload.comments,
        data: action.payload.udoData,
      }
      return state.updateIn(['parties', action.payload.partyName], parties => parties.push(payload))
                  .update('versions', payload.version)
    }

    case types.APPROVE: {
      return
    }

    case types.ABANDON: {
      return
    }

    case types.UNMATCH: {
      return
    }

    case types.CHECK_STATUS: {
      return updateStatus(state, action.payload)
    }

    default:
      return state
  }
}

const covenant = {
  actions,
  reducer,
  selectors,
}

module.exports = covenant
