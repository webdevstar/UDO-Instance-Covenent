const Immutable = require('seamless-immutable')

const actionTypes = {
  RESUBMIT_UDO_DATA: 'RESUBMIT_UDO_DATA'
}

const actions = {
  resubmit: value => ({
    type: actionTypes.RESUBMIT_UDO_DATA,
    payload: value
  })
}

const initialState = Immutable.from({ })

const reducer = (state = initialState, action) => {

  switch (action.type) {
    case actionTypes.RESUBMIT_UDO_DATA: {
      const updateState = Immutable.from(action.payload)
      return updateState
    }

    default:
      return state
  }
}

const udoInstanceManager = {
  actions,
  reducer
}

module.exports = udoInstanceManager