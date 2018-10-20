const Immutable = require('seamless-immutable')
const fs = require('fs')
const path = require('path')
const { interbitTypes, redispatch } = require('../test/harness')
const getSchema = require('./schema/getSchema')
const udoReconcile = require('./schema/udoReconcile')
const udoValidate = require('./schema/udoValidate')

const actionTypes = {
    PROPOSE: 'PROPOSE',
    APPROVE: 'APPROVE',
    ABANDON: 'ABANDON',
    UNMATCH: 'UNMATCH',
    INITIALIZE: 'INITIALIZE',
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

      const reconcileResult = udoReconcile(payload.data.properties, schema.reconcileCriteria)

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

      const validateResult = udoValidate(payload.data.properties, schema.dataSchema.properties)

      if (!validateResult) {
        currentStatus = statusTypes.INVALID
      }

    })

  }

  if(!currentStatus){
    currentStatus = statusTypes.AUTO_RECONCILED
  }

  let updateState = Immutable.setIn(state, ['status'], currentStatus)
  let updateUnreconciled = Immutable.setIn(updateState, ['unreconciled'], unreconciled)

  return updateUnreconciled

}

const reducer = (state = initialState, action) => {

    const status =  Immutable.getIn(state, 'status')

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

        if (status == statusTypes.IRRECONCILABLE) {

          return state

        }
        else {

          const version = Immutable.getIn(state, 'versions')

          const payload = {

            version: version + 1,
            timestamp: action.payload.timestamp,
            comments: action.payload.comments,
            data: action.payload.udoData,

          }

          var mutableParty = Immutable.asMutable(state.parties[action.payload.partyName])
          mutableParty[mutableParty.length] = payload

          const addNewProposal = Immutable.setIn(state, ['parties', action.payload.partyName], mutableParty)
          const updateNewVersion = Immutable.update(addNewProposal, 'versions', version => version + 1)

          return updateStatus(updateNewVersion)

        }

      }

      // case actionTypes.APPROVE: {

      //   if (status == statusTypes.IRRECONCILABLE || status == statusTypes.INVALID) {

      //     return state

      //   }
      //   else {

      //     let hasPartyName = false
      //     const apprPartyName = action.payload.partyName

      //     state.expectedParties.forEach((partyName) => {
      //       if (partyName == apprPartyName) {
      //         hasPartyName = true
      //       }
      //     })

      //     if (hasPartyName) {

      //       const version = state.get('versions')
      //       const payloadArray = state.getIn(["parties", apprPartyName])
      //       const lastPayload = payloadArray[payloadArray.length - 1]
      //       lastPayload.version = version + 1

      //       const unreconciled = state.get('unreconciled')
      //       const properties = unreconciled.properties

      //       for (key in properties) {

      //         if (key != apprPartyName) {

      //           let isEmpty = true
      //           const reason  = properties[key]

      //           for (subKey in reason) {
      //             if (subKey == apprPartyName) {
      //               delete reason[apprPartyName]
      //             } else {
      //               isEmpty = false
      //             }
      //           }

      //           if (isEmpty) {
      //             delete properties[key]
      //           }

      //         }

      //       }  

      //       if (Object.keys(properties) == 0) {

      //         return state.updateIn(['parties', apprPartyName], parties => parties.push(lastPayload))
      //               .update('unreconciled', unreconciled).update('versions', version + 1).update('status', statusTypes.USER_RECONCILED)
            
      //       } else {

      //         return state.updateIn(['parties', apprPartyName], parties => parties.push(lastPayload))
      //               .update('unreconciled', unreconciled).update('versions', version + 1)

      //       }

      //     } else {

      //       return state

      //     }

      //   }

      // }

      // case actionTypes.ABANDON: {

      //   let hasPartyName = false
      //   const apprPartyName = action.payload.partyName

      //   state.expectedParties.forEach((partyName) => {
      //     if (partyName == apprPartyName) {
      //       hasPartyName = true
      //     }
      //   })

      //   if (hasPartyName) {

      //     const reason = action.payload.reason
      //     return state.update('status', statusTypes.IRRECONCILABLE).updateIn(['unreconciled', 'reason'], x => x = reason)
        
      //   } else {

      //     return state

      //   }

      // }

      // case actionTypes.UNMATCH: {

      //   const status = state.get('status')

      //   if (status == statusTypes.isReconciled) {

      //     return state

      //   } else {

      //     let hasManyUDO = false

      //     state.expectedParties.forEach((partyName) => {

      //       const payloadArray = state.getIn(["parties", partyName])

      //       if (payloadArray && payloadArray.length > 1) {

      //         hasManyUDO = true

      //       }

      //     })

      //   }

      // }

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