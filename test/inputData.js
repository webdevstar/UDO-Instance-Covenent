const secondParties = ["anvil", "birdseed"]
const thirdParties = ["anvil", "birdseed", "apple"]
const anvilProposal = {
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
const anvilUnreconciledProposal = {
  partyName: 'anvil',
  timestamp: '2018-01-01 00:00:00',
  comments: 'anvil unreconciled proposal',
  udoData: {
    "serialNumber": "1234567890",
    "material": {
      "materialQuality": 2,
      "materialType": "steel"
    }
  }
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
const anvilApprove = {
  partyName: 'anvil',
  timestamp: '2018-02-01 00:00:00',
  comments: 'anvil approve',
}
const anvilAbandon = {
  partyName: 'anvil',
  reason: 'This UDO Instance cannot be reconciled'
}
const birdseedProposal = {
  partyName: 'birdseed',
  timestamp: '2018-01-01 00:00:00',
  comments: 'birdseed new proposal',
  udoData: {
    "reasonForPurchase": "ABCDEFGHIJKL"
  }
}
const birdseedUnreconciledProposal = {
  partyName: 'birdseed',
  timestamp: '2018-01-01 00:00:00',
  comments: 'birdseed unreconciled proposal',
  udoData: {}
}
const birdseedApprove = {
  partyName: 'birdseed',
  timestamp: '2018-02-01 00:00:00',
  comments: 'birdseed approve',
}
const appleProposal = {
  partyName: 'apple',
  timestamp: '2018-01-01 00:00:00',
  comments: 'apple new proposal',
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
const appleApprove = {
  partyName: 'apple',
  timestamp: '2018-02-01 00:00:00',
  comments: 'apple approve',
}
const appleAbandon = {
  partyName: 'apple',
  reason: 'This UDO Instance cannot be reconciled'
}

module.exports = {
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
}