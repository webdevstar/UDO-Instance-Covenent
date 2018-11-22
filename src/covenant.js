const Immutable = require('seamless-immutable')
const _ = require('lodash')
const { createStore } = require('redux')
const getSchema = require('./schema/getSchema')
const udoReconcile = require('./schema/udoReconcile')
const udoValidate = require('./schema/udoValidate')
const udoInstanceManager = require('./udoInstanceManager')

const actionTypes = {
  INITIALIZE: 'INITIALIZE',
  PROPOSE: 'PROPOSE',
  APPROVE: 'APPROVE',
  ABANDON: 'ABANDON',
  UNMATCH: 'UNMATCH',
  RESUBMIT_UDO_DATA: 'RESUBMIT_UDO_DATA',
  DESTROY_CHAIN: 'DESTROY_CHAIN'
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
  initialize: initial => ({
    type: actionTypes.INITIALIZE,
    payload: initial
  }),
  propose: proposal => ({
    type: actionTypes.PROPOSE,
    payload: proposal
  }),
  approve: value => ({
    type: actionTypes.APPROVE,
    payload: value
  }),
  abandon: value => ({
    type: actionTypes.ABANDON,
    payload: value
  }),
  unmatch: () => ({
    type: actionTypes.UNMATCH
  })
}
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
    return state.getIn(['status'])
  },
  getParties: (state) => {
    return state.getIn(['parties'])
  },
  getDataListForParty: (state, parties) => {
    let partiesData = parties
    parties.forEach((party) => {
      partiesData[party] = state.getIn(['parties', party])
    })
    return partiesData
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
const updateStatus = (state) => {
  let currentStatus = false
  let unreconciled = {}
  const properties = {}

  // PENDING status
  state.expectedParties.forEach((expPartyName) => {
    const payloadArray = state.getIn(['parties', expPartyName])

    if (payloadArray.length === 0) {
      currentStatus = statusTypes.PENDING
    }
  })

  // UNRECONCILED status
  if(!currentStatus){
    state.expectedParties.forEach((expPartyName) => {
      const payloadArray = state.getIn(['parties', expPartyName])
      const payload = payloadArray[payloadArray.length - 1]
      const schema = getSchema(expPartyName)
      const reconcileResult = udoReconcile(payload.data, schema.reconcileCriteria)

      if (!reconcileResult.reconciled) {
        const reason = {}
        reason[expPartyName] = reconcileResult.reason
        state.expectedParties.forEach((partyName) => {
          if (partyName != expPartyName) {
            properties[partyName] = reason
          }
        })

        currentStatus = statusTypes.UNRECONCILED
        unreconciled = {properties: properties}
      }
    })
  }

  // INVALID status
  if(!currentStatus){
    state.expectedParties.forEach((expPartyName) => {
      const payloadArray = state.getIn(['parties', expPartyName])
      const payload = payloadArray[payloadArray.length - 1]
      const schema = getSchema(expPartyName)
      const validateResult = udoValidate(payload.data, schema.dataSchema)

      if (!validateResult) {
        currentStatus = statusTypes.INVALID
      }
    })
  }

  // AUTO_RECONCILED status
  if(!currentStatus){
    currentStatus = statusTypes.AUTO_RECONCILED
  }

  let updateStatus = state.setIn(['status'], currentStatus)
                          .setIn(['unreconciled'], unreconciled)

  return updateStatus
}

const initialState = Immutable.from({
  parties: {},
  expectedParties: [],
  status: '',
  unreconciled: {},
  versions: 0,
})
const reducer = (state = initialState, action) => {
  const status =  state.getIn(['status'])
  switch (action.type) {
    case actionTypes.INITIALIZE: {
      let parties = {}
      let expectedParties = []

      action.payload.forEach((partyName) => {
        parties[partyName] = []
        expectedParties.push(partyName)
      })
      const updateState = state.setIn(['parties'], parties)
                                .setIn(["expectedParties"], expectedParties)

      return updateStatus(updateState)
    }

    case actionTypes.PROPOSE: {
      if (status == statusTypes.IRRECONCILABLE || _.indexOf(state.expectedParties, action.payload.partyName) === -1) return state
      else {
        const version = state.getIn(['versions'])
        const payload = {
          version: version + 1,
          timestamp: action.payload.timestamp,
          comments: action.payload.comments,
          data: action.payload.udoData,
        }
        let party = state.parties[action.payload.partyName].asMutable()
        party.push(payload)

        const updateState = state.setIn(['parties', action.payload.partyName], party)
                                  .update(['versions'], version => version + 1)

        return updateStatus(updateState)
      }
    }

    case actionTypes.APPROVE: {
      const partyName = action.payload.partyName

      if (status == statusTypes.IRRECONCILABLE || status == statusTypes.INVALID || _.indexOf(state.expectedParties, partyName) === -1) return state
      else {
        const version = state.getIn(['versions'])
        const payloadArray = state.getIn(['parties', partyName])
        const lastPayload = payloadArray[payloadArray.length - 1]
        const payload = {
          version: version + 1,
          timestamp: action.payload.timestamp,
          comments: action.payload.comments,
          data: lastPayload.data,
        }

        const unreconciled = state.unreconciled.properties.asMutable()
        let properties = unreconciled
        for (key in unreconciled) {
          if (key != partyName) {
            let isEmpty = true
            for (let subKey in unreconciled[key]) {
              if (subKey === partyName) {
                delete properties[key]
              } else {
                isEmpty = false
              }
            }
            if (isEmpty) {
              delete properties[key]
            }
          }
        }
        if (Object.keys(properties).length === 0) {
          var party = state.parties[partyName].asMutable()
          party.push(payload)
          const updateState = state.setIn(['parties', partyName], party)
                                    .setIn(['unreconciled'], {})
                                    .update(['versions'], version => version + 1)
                                    .setIn(['status'], statusTypes.USER_RECONCILED)
          return updateState
        }
        else {
          var party = state.parties[partyName].asMutable()
          party.push(payload)
          let updateState = state.setIn(['parties', partyName], party)
                                  .setIn(['unreconciled', 'properties'], properties)
                                  .update(['versions'], version => version + 1)

          return updateState
        }

      }
    }

    case actionTypes.ABANDON: {
      if (_.indexOf(state.expectedParties, action.payload.partyName) > -1) {
        let updateState = state.setIn(['status'], statusTypes.IRRECONCILABLE)
                                .setIn(['unreconciled', 'reason'], action.payload.reason)

        return updateState
      } else return state
    }

    case actionTypes.UNMATCH: {
      let hasManyUDO = false
      state.expectedParties.forEach((partyName) => {
        const payloadArray = state.getIn(["parties", partyName])
        if (payloadArray && payloadArray.length > 1) {
          hasManyUDO = true
        }
      })
      if (status == statusTypes.IRRECONCILABLE || hasManyUDO) return state
      else {
        const { resubmit } = udoInstanceManager.actions
        let store = createStore(udoInstanceManager.reducer)

        store.dispatch(resubmit(state))
        if(Object.keys(store.getState()).length > 0){
          return {}
        }
        else return state
      }
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