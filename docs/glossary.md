# Glossary

* <a name="action"></a>**Action**
  An command, or instruction, that should be processed to modify the
  current state of a blockchain.

* <a name="action_pool"></a>**Action Pool**
  A buffer of actions that are flowing into the hypervisor. The buffer
  should be self-blocking: actions should be processed sequentially.

* <a name="covenant"></a>**Covenant**
  A javascript object describing the code and configuration that manages
  the evolution of a [state](#state). See [Covenant](covenant.md) for
  details.

* <a name="reducer"></a>**Reducer**
  A reducer, or smart contract, provides the business logic for
  responding to actions. The smart contract defines all of the commands,
  or instructions, that can modify a blockchain's state.

* <a name="state"></a>**State**
  A state is a key->value dictionary, stored on a blockchain, with an
  arbitrary initial definition. Since blocks on a blockchain are
  immutable, the state can only be modified via the [reducer](#reducer).

* <a name="side_effects"></a>**Side effects**
  A side effect is any observable effect outside of the state. See [Side
  effects](side_effects.md) for details.

* <a name="udo"></a>**UDO: User Defined Object**
  A JSON object of any shape, containing some metadata: timestamp, version, submitter, comments. This object is defined by a schema provided by the users. A UDO schema defines the data model, and a UDO Instance is a chain for a UDO that contains data from one or more parties participating in the reconciliation of that UDO.

* <a name="party"></a>**Party**
  An entity that is participating in the reconciliation process for any given UDO.

* <a name="reconciliation"></a>**Reconciliation**
  The action of making one view or belief compatible with another. In the context of this application, it is the process of amending and comparing data between two or more parties until both parties agree on the given data, per the UDO Schema reconciliation criteria.

* <a name="udo_schema"></a>**UDO Schema**
  The JSON object that defines the UDO. A UDO Schema is made up of a schema for the data, and a set of reconciliation criteria, as well as a UDO Schema Type.

For more terms and concepts refer to the [Interbit Documentation](https://docs.interbit.io/key-concepts/)
