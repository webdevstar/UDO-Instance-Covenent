const Immutable = require('seamless-immutable')
const fs = require('fs')
const path = require('path')
const { interbitTypes, redispatch } = require('../test/harness')
const getSchema = require('./schema/getSchema')
const udoValidate = require('./schema/udoValidate')
const udoValidate = require('./schema/udoReconcile')

const types = {
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
    initialize: value => ({
      type: types.INITIALIZE,
      payload: value
    }),
    propose: value => ({
      type: types.PROPOSE,
      payload: value
    }),
    approve: value => ({
      type: types.APPROVE,
      payload: value
    }),
    abandon: value => ({
      type: types.ABANDON,
      payload: value
    }),
    unmatch: value => ({
      type: types.UNMATCH
    })
}

const initialState = Immutable.from({
    parties: {    
    },
    expectedParties: []
    status: 'PENDING',
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
    
    //check pending status
    state.expectedParties.forEach((partyName) => {
      if (!state.hasIn(['parties', partyName, 0])) {
          return state.update('status', statusTypes.PENDING)          
      }
    })

    //check reconciled status
      
    const properties = {}
    let currentStatus = statusTypes.AUTO_RECONCILED
    
    state.expectedParties.forEach((expPartyName) => {

      const payloadArray = state.getIn(["parties", expPartyName])
      const payload = payloadArray[payloadArray.length - 1]

      const schema = getSchema(expPartyName)
        const criteria = schema.reconcileCriteria
        const udoReconcile = udoReconcile(payload.data, criteria)
        
        if (!udoReconcile.reconciled) {
          currentStatus = statusTypes.UNRECONCILED
          const reason = {}
          reason[expPartyName] = udoReconcile.reason

          state.expectedParties.forEach((partyName) => {
          if (partyName != expPartyName) {
            properties[partyName] = reason
          }
        })
        }
    })

    const unreconciled = {properties: properties}

    //check invalid status
    state.expectedParties.forEach((expPartyName) => {

      const payloadArray = state.getIn(["parties", expPartyName])
      const payload = payloadArray[payloadArray.length - 1]

      const schema = getSchema(expPartyName)
        let udoValidate = udoValidate(payload.data, schema)
        
        if (!udoValidate) {
          currentStatus = statusTypes.INVALID         
        }
    })

    return state.update('unreconciled', unreconciled).update('status', currentStatus)
}

const reducer = (state = initialState, action) => {
    switch (action.type) {

      case types.INITIALIZE: {
          const parties;
          action.payload.forEach((key) => parties[key] = [] )
          return state.set('expectedParties', action.payload).set('parties', parties)
      }
      
      case types.PROPOSE: {

        const status =  state.get('status')
          if (status == statusTypes.IRRECONCILABLE) {
            return state
          } else {
            const version = state.get('versions')
            const payload = {
              version: version + 1,
              timestamp: action.payload.timestamp,
              comments: action.payload.comments,
              data: action.payload.udoData,
            }
            const updatedState = state.updateIn(['parties', action.payload.partyName], parties => parties.push(payload))
                .update('versions', version + 1)

            return updateStatus(updatedState)
          }
      }

      case types.APPROVE: {       
        const status =  state.get('status')
        if (status == statusTypes.IRRECONCILABLE || status == statusTypes.INVALID) {
          return state
        } else {
          let hasPartyName = false
          const apprPartyName = action.payload.partyName
          state.expectedParties.forEach((partyName) => {
            if (partyName == apprPartyName) {
              hasPartyName = true
            }
          })

          if (hasPartyName) {

            const version = state.get('versions')
            const payloadArray = state.getIn(["parties", apprPartyName])
            const lastPayload = payloadArray[payloadArray.length - 1]
            lastPayload.version = version + 1

            const unreconciled = state.get('unreconciled')
            const properties = unreconciled.properties

            for (key in properties) {
              if (key != apprPartyName) {
                let isEmpty = true
                const reason  = properties[key]
                for (subKey in reason) {
                  if (subKey == apprPartyName) {
                    delete reason[apprPartyName]
                  } else {
                    isEmpty = false
                  }
                }

                if (isEmpty) {
                delete properties[key]
                }
              }
            }  

            if (Object.keys(properties) == 0) {
              return state.updateIn(['parties', apprPartyName], parties => parties.push(lastPayload))
                    .update('unreconciled', unreconciled).update('versions', version + 1).update('status', statusTypes.USER_RECONCILED)
            } else {
              return state.updateIn(['parties', apprPartyName], parties => parties.push(lastPayload))
                    .update('unreconciled', unreconciled).update('versions', version + 1)
            }
          } else {
            return state
          }           
        }
      }

      case types.ABANDON: {
        let hasPartyName = false
        const apprPartyName = action.payload.partyName
        state.expectedParties.forEach((partyName) => {
          if (partyName == apprPartyName) {
            hasPartyName = true
          }
      })
      if (hasPartyName) {
        const reason = action.payload.reason
        return state.update('status', statusTypes.IRRECONCILABLE).updateIn(['unreconciled', 'reason'], x => x = reason)
      } else {
        return state
      }
          return
      }

      case types.UNMATCH: {
        const status = state.get('status')
        if (status == statusTypes.isReconciled) {
          return state
        } else {
          let hasManyUDO = false
          state.expectedParties.forEach((partyName) => {
            const payloadArray = state.getIn(["parties", partyName])
            if (payloadArray && payloadArray.length > 1) {
              hasManyUDO = true
            }
          })
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