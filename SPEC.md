# UDO Instance Covenant

## Context

This covenant is part of a reconciliation process between multiple
parties that define their own data objects with a schema (UDO =
user-defined object). The parties submitting data to the covenant must
come to an agreement on the state of the data by dispatching
`UPDATE_UDO` actions until the data matches a reconciliation criteria
defined by a schema.

Two sample schema have been provided in the `src/schema` directory. To
get a schema by type, call the `getSchema(schemaType)` function using
the type you wish to retrieve.


## Covenant Description

The UDO Instance covenant is one that represents an UDO instance between
two or more parties. It performs UDO validation and reconciliation and
sets a [status](#statuses) for the instance based on a UDO instance ID
and matching criteria for the UDO type.

Given two JSON UDO instances, it looks up the matching criteria for
the UDO type and sets a status for the two objects on every action. If
the UDO instances are in agreement, an `AUTO_RECONCILED` status is set
if the data was from ingest (an external data collection service), or a
`USER_RECONCILED` status is set if a user initiated the reconciliation.
If they are not in agreement, an `UNRECONCILED` status is set.

If only some of the UDO instance data is available, and one or more
parties have not yet input their system data or responded to the UDO
Instance, then the status is set to `PENDING`.

If one or more party has entered data that did not validate (for
example, a string should be a number, a price is -15 when it should be
positive, etc.), the status is set to `INVALID`.

> Note: This covenant does not require a saga.

> Note: Two sample schema have been provided in the `src/schema`
> directory. To get a schema by type, call the `getSchema(schemaType)`
> function using the type you wish to retrieve.


### Statuses

| Status            | Description                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `PENDING`         | Not all parties have submitted their UDO data to reconcile against.                                            |
| `AUTO_RECONCILED` | All parties have submitted reconciled data from ingest, which was automatically done.                          |
| `USER_RECONCILED` | A user proposed a new, in agreement, version of the data, or a user approved the latest version of a proposal. |
| `UNRECONCILED`    | All parties have submitted data, one or more sets do not reconcile.                                            |
| `IRRECONCILABLE`  | This data is off-base, and a user has indicated that it can't, or won't, be reconciled.                        |
| `INVALID`         | One party has submitted data that does not validate.                                                           |


### State Slices

| State Slice                               | Usage                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `parties`                                 | Each party's historical view of the UDO Instance data.                                                                          |
| `parties[partyName]`                      | An individual party's view of their historical UDO instance data, where the name of the party is `partyName`.                   |
| `expectedParties`                         | The parties that are going to participate in adding data to the UDO instance.                                                   |
| `status`                                  | The [status](#statuses) of the UDO Instance.                                                                                    |
| `unreconciled`                            | Which criteria are unreconciled for disagreeing versions of the UDO instance data between parties.                              |
| `unreconciled.properties[partyA][partyB]` | The set of unreconciled properties between the parties named `partyA` and `partyB`, for only the latest versions of their data. |
| `unreconciled.reason`                     | The reason that an UDO instance may be irreconcilable.                                                                          |


```js
const state = {
  parties: {
    partyA: [
      {
        timestamp: 1234567890,
        version: 1,
        submitter: 'asud903rjpdkeps0da09jda09diew09dw90ed',
        comments: '',
        data: {
          ...udoInstanceData
        }
      },
      {
        timestamp: 123457000,
        version: 3,
        submitter: 'asud903rjpdkeps0da09jda09diew09dw90ed',
        comments: '',
        data: {
          ...udoInstanceData
        }
      }
    ],
    partyB: [
      {
        timestamp: 1234569999,
        version: 2,
        submitter: '93wu09rj34w09rjw0erjwe90jr0ewj9r0ew9odj',
        comments: '',
        data: {
          ...udoInstanceData
        }
      }
    ]
  },
  expectedParties: ['partyA', 'partyB'],
  status: 'UNRECONCILED',
  unreconciled: {
    partyA: {
      partyB: [ 'property', 'anotherProperty' ]
    }
  }
}
```


### Actions


#### a. `PROPOSE`

Propose a new version of the UDO instance data for reconciliation.


##### Payload

- `partyName`: The party making the proposal.
- `timestamp`: The UTC timestamp of the proposal.
- `comments`: Comments from the proposing party about this modification.
- `udoData`: The UDO Instance data being proposed.


##### State Changes

* Inserts a new UDO Instance Data version for the `partyName` with an
  appropriate version number.

* Sets the status to one of: `USER_RECONCILED`, `UNRECONCILED`,
  `PENDING`, or `INVALID` based on [statuses](#statuses).


##### Tests

The following tests should be implemented to verify the correctness of
this action's operation:

- Sets `status` to `RECONCILED` for reconciled UDO instance data between 2
  parties.

- Sets `status` to `RECONCILED` for reconciled UDO instance data between
  3 parties.

- Sets `status` to `PENDING` when only one party has submitted UDO
  Instance.

- Sets `status` to `PENDING` when only 2/3 parties have submitted UDO
  Instance.

- Sets `status` to `UNRECONCILED` for unreconciled UDO instance data
  between parties.

- Sets `status` to `UNRECONCILED` for unreconciled UDO instance data
  between parties when 2/3 parties agree.

- Sets `status` to `INVALID` when 1/2 parties have submitted invalid
  data.

- Adds unreconciled properties to the `unreconciled` state slice for
  the appropriate parties.

- Removes data properties that are now reconciled from the
  `unreconciled` state slice.

- Appends UDO Instance data with the correct version number to the
  correct party.

- Ignored UDO Instance data if party is not an expected party.

- Does nothing if `status` is `IRRECONCILABLE`.


#### b. `APPROVE`

Approve the most recently proposed version of the UDO Instance data for
reconciliation.


##### Payload

- `partyName`: The name of the party approving this proposal.
- `comments`: Comments from the proposing party about this modification.
- `timestamp`: The UTC timestamp of the approval.


##### State Changes

* Inserts a new version of the data for `partyName` that is the same as
  the latest version.

* Removes any data from the `unreconciled` state slice that is no longer
  reconciled.

* Sets status to `USER_RECONCILED`, if all parties agree.


##### Tests

The following tests should be implemented to verify the correctness of
this action's operation:

- Inserts the latest UDO Instance Data again into party's data as newest
  version with action timestamp.

- Sets `status` to `USER_RECONCILED` if all parties agree.

- Adds unreconciled properties to the `unreconciled` state slice for
  the appropriate parties.

- Removes data properties that are now reconciled from the
  `unreconciled` state slice.

- Does nothing if the party named by `partyName` is not an expected
  party.

- Does nothing if `status` is `IRRECONCILABLE`.

- Does nothing if `status` is `INVALID`.


#### c. `ABANDON`

Indicate that this UDO Instance is irreconcilable for some reason.


##### Payload

- `partyName`: The party that cannot reconcile the UDO Instance.
- `reason`: The reason that this UDO Instance cannot be reconciled.


##### State Changes

* Sets status to `IRRECONCILABLE`.
* Sets `unreconciled.reason` to action payload.


##### Tests

The following tests should be implemented to verify the correctness of
this action's operation:

- Sets `status` to `IRRECONCILABLE`.

- Sets `unreconciled.reason` to the action payload.

- Does nothing if the party named by `partyName` is not an expected
  party.


#### d. `UNMATCH`

Indicates that the UDO instance data, that has been automatically matched
together by the system, was erroneous. Marks the data in this UDO
Instance to be consumed again by the _UDO Instance Manager_ for
rematching.


##### Payload

None.


##### State Changes

* Dispatches the `RESUBMIT_UDO_DATA` action to the _UDO Instance
  Manager_, then destroys itself.


##### Tests

The following tests should be implemented to verify the correctness of
this action's operation:

- Does nothing if any party has more than one UDO Instance data.

- Does nothing if `status` is `IRRECONCILABLE`.

- Sends a `RESUBMIT_UDO_DATA` action to the _UDO Instance Manager_.

- Queues a `DESTROY_CHAIN` action once `RESUBMIT_UDO_DATA` was received
  by the _UDO Instance Manager_.

- Does not queue a `DESTROY_CHAIN` action if the _UDO Instance Manager_
  has not received `RESUBMIT_UDO_DATA`.


### Selectors

> Note: All selectors should accept `state` as the first parameter. For
> example:
>
> `const mySelector = (state, ...args) => { }`

| Selector                    | Purpose                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `getUdo`                    | Gets the UDO instance.                                                                        |
| `getUdoType`                | Gets the UDO Type.                                                                            |
| `getUdoId`                  | Gets the UDO ID.                                                                              |
| `getStatus`                 | Gets the status for this UDO instance.                                                        |
| `getParties`                | Gets all of the data for each party.                                                          |
| `getDataListForParty`       | Gets the data for a specified party in an array.                                              |
| `getLatestDataForParty`     | Gets the most recent version of the UDO data for the party.                                   |
| `getLatestPartyData`        | Gets the most recent versions of the UDO data for every party, in an array.                   |
| `getExpectedParties`        | Gets the name of each party expected to participate in submitting data for this UDO Instance. |
| `getUnreconciled`           | Gets the entire set of unreconciled properties.                                               |
| `getUnreconciledForParties` | Gets the unreconciled properties between two parties.                                         |
| `getIrreconcilableReason`   | Gets the reason the UDO Instance is IRRECONCILABLE.                                           |
| `isReconciled`              | Indicates whether this UDO instance is reconciled.                                            |
| `isPending`                 | Indicates whether this UDO instance is pending.                                               |
| `isValid`                   | Indicates whether this UDO instance is valid.                                                 |
| `isUnreconciled`            | Indicates whether this UDO instance is reconciled.                                            |
| `isIrreconcilable`          | Indicates whether this UDO instance is unable to be reconciled.                               |


### Selector tests

The following tests should be implemented to verify the correctness of
the covenant's operation:

- A positive test for each selector.

- A test that each selector, when it returns an array type, returns []
  if data is unavailable.

- A test that each selector, when it does not return an array, returns
  undefined if data is unavailable.
