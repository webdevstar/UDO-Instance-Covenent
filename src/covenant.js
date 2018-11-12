const Immutable = require('seamless-immutable')
const _ = require('lodash');
const fs = require('fs')
const path = require('path')
const { interbitTypes, redispatch } = require('../test/harness')
const getSchema = require('./schema/getSchema')
const udoReconcile = require('./schema/udoReconcile')
const udoValidate = require('./schema/udoValidate')

const actionTypes = {
  INITIALIZE: 'INITIALIZE',
  PROPOSE: 'PROPOSE',
  APPROVE: 'APPROVE',
  ABANDON: 'ABANDON',
  UNMATCH: 'UNMATCH',
  RESUBMIT_UDO_DATA: 'RESUBMIT_UDO_DATA'
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
  unmatch: value => ({
    type: actionTypes.UNMATCH
  }),
  resubmit: value => ({
    type: actionTypes.RESUBMIT_UDO_DATA
  })
}

const initialState = Immutable.from({
  parties: {},
  expectedParties: [],
  status: '',
  unreconciled: {},
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

const updateStatus = (state) => {

  let currentStatus = false
  let unreconciled = {}
  const properties = {}

  // PENDING status
  state.expectedParties.forEach((expPartyName) => {

    const payloadArray = Immutable.getIn(state, ['parties', expPartyName])

    if (payloadArray.length === 0) {
      currentStatus = statusTypes.PENDING
    }

  })

  // UNRECONCILED status
  if(!currentStatus){

    state.expectedParties.forEach((expPartyName) => {

      const payloadArray = Immutable.getIn(state, ['parties', expPartyName])
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

      const payloadArray = Immutable.getIn(state, ['parties', expPartyName])
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

  let updateStatus = Immutable.setIn(state, ['status'], currentStatus)
  updateStatus = Immutable.setIn(updateStatus, ['unreconciled'], unreconciled)

  return updateStatus

}

const reducer = (state = initialState, action) => {

  const status =  Immutable.getIn(state, ['status'])

  switch (action.type) {

    case actionTypes.INITIALIZE: {

      let parties = {}
      let expectedParties = []

      action.payload.forEach((partyName) => {

        parties[partyName] = []
        expectedParties.push(partyName)

      })
      const setParties = Immutable.setIn(state, ['parties'], parties)
      const setExpectedParties = Immutable.setIn(setParties, ["expectedParties"], expectedParties)

      return updateStatus(setExpectedParties)

    }
    
    case actionTypes.PROPOSE: {

      if (status == statusTypes.IRRECONCILABLE || _.indexOf(state.expectedParties, action.payload.partyName) === -1) return
      else {
        const version = Immutable.getIn(state, ['versions'])
        const payload = {

          version: version + 1,
          timestamp: action.payload.timestamp,
          comments: action.payload.comments,
          data: action.payload.udoData,

        }
        var party = Immutable.asMutable(state.parties[action.payload.partyName])
        party.push(payload)

        let updateState = Immutable.setIn(state, ['parties', action.payload.partyName], party)
        updateState = Immutable.update(updateState, ['versions'], version => version + 1)

        return updateStatus(updateState)
      }

    }

    case actionTypes.APPROVE: {

      const apprPartyName = action.payload.partyName

      if (status == statusTypes.IRRECONCILABLE || status == statusTypes.INVALID || _.indexOf(state.expectedParties, apprPartyName) === -1) return
      else {

        const version = Immutable.getIn(state, ['versions'])
        const payloadArray = Immutable.getIn(state, ['parties', apprPartyName])
        const lastPayload = payloadArray[payloadArray.length - 1]
        const payload = {

          version: version + 1,
          timestamp: action.payload.timestamp,
          comments: action.payload.comments,
          data: lastPayload.data,

        }

        const unreconciled = Immutable.asMutable(state.unreconciled.properties)
        let properties = unreconciled

        for (key in unreconciled) {

          if (key != apprPartyName) {

            let isEmpty = true
            for (let subKey in unreconciled[key]) {
              if (subKey === apprPartyName) {
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
          var party = Immutable.asMutable(state.parties[apprPartyName])
          party.push(payload)
          let updateState = Immutable.setIn(state, ['parties', apprPartyName], party)
          updateState = Immutable.setIn(updateState, ['unreconciled'], {})
          updateState = Immutable.update(updateState, ['versions'], version => version + 1)
          updateState = Immutable.setIn(updateState, ['status'], statusTypes.USER_RECONCILED)
          return updateState
        }
        else {
          var party = Immutable.asMutable(state.parties[apprPartyName])
          party.push(payload)
          let updateState = Immutable.setIn(state, ['parties', apprPartyName], party)
          updateState = Immutable.setIn(updateState, ['unreconciled', 'properties'], properties)
          updateState = Immutable.update(updateState, ['versions'], version => version + 1)

          return updateState
        }

      }

    }

    case actionTypes.ABANDON: {

      if (_.indexOf(state.expectedParties, action.payload.partyName) > -1) {
        let updateState = Immutable.setIn(state, ['status'], statusTypes.IRRECONCILABLE)
        updateState = Immutable.setIn(updateState, ['unreconciled', 'reason'], action.payload.reason)

        return updateState
      
      } else return

    }

    case actionTypes.UNMATCH: {

      let hasManyUDO = false

      state.expectedParties.forEach((partyName) => {
        const payloadArray = Immutable.getIn(state, ["parties", partyName])
        if (payloadArray && payloadArray.length > 1) {
          hasManyUDO = true
        }
      })

      if (status == statusTypes.IRRECONCILABLE || hasManyUDO) return
      else {
        // action.resubmit()
      }

    }

    default:
      return
  }
}

const covenant = {
  actions,
  reducer,
  selectors,
}

module.exports = covenant