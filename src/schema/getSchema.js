const getSchema = (schemaType) => {
  const reconcileCriteria = require(`./${schemaType}.reconcile.json`)
  const dataSchema = require(`./${schemaType}.schema.json`)

  return {
    type: schemaType,
    reconcileCriteria,
    dataSchema
  }
}

module.exports = getSchema
