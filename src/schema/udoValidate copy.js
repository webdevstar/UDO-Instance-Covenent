const _ = require('lodash');

const validateKey = {
	list: { type: 'type', enum: 'enum', const: 'const', booleanLogic:'booleanLogic' },
	booleanLogic: { allOf: 'allOf', anyOf: 'anyOf', oneOf: 'oneOf', not: 'not' },
	type: {
		list: {
			number: 'number',
			integer: 'integer',
			string: 'string',
			array: 'array',
			object: 'object'
		},
		number: {
			multipleOf: 'multipleOf',
			maximum: 'maximum',
			exclusiveMaximum: 'exclusiveMaximum',
			minimum: 'minimum',
			exclusiveMinimum: 'exclusiveMinimum'
		},
		string: {
			maxLength: 'maxLength',
			minLength: 'minLength',
			pattern: 'pattern'
		},
		array: {
			items: 'items',
			additionalItems: 'additionalItems',
			maxItems: 'maxItems',
			minItems: 'minItems',
			uniqueItems: 'uniqueItems',
			contains: 'contains'
		},
		object: {
			maxProperties: 'maxProperties',
			minProperties: 'minProperties',
			required: 'required',
			properties: 'properties',
			additionalProperties: 'additionalProperties',
			patternProperties: 'patternProperties',
			dependencies:'dependencies',
			propertyNames: 'propertyNames'
		}
	}
}

const validateNumber = (key, schema, udo) => {
	switch(key) {
		case validateKey.type.number.multipleOf:
			if(Number.isInteger(udo/schema)) return true
			else return false
		case validateKey.type.number.maximum:
			if(udo <= schema) return true
			else return false
		case validateKey.type.number.exclusiveMaximum:
			if(udo < schema) return true
			else return false
		case validateKey.type.number.minimum:
			if(udo >= schema) return true
			else false
		case validateKey.type.number.exclusiveMinimum:
			if(udo > schema) return true
			else return false
		default:
			return true
	}
}

const validateString = (key, schema, udo) => {
	switch(key) {
		case validateKey.type.string.maxLength:
			if(udo.length <= schema) return true
			else return false

		case validateKey.type.string.minLength:
			if(udo.length >= schema) return true
			else return false

		case validateKey.type.string.pattern:
			var found = udo.match(schema);
			if(found) return true
			else return false

		default:
			return true
	}
}

const validateArray = (key, schema, udo) => {
	switch(key) {
		case validateKey.type.array.items:
			if(Array.isArray(schema[key])) {
				if(udo.length <= schema[key].length || !schema[validateKey.type.array.additionalItems]){
					for(let i=0; i<udo.length; i++){
						if(schema[key][i]){
							for(let itemKey in schema[key][i]){
								if(validateKey.list.hasOwnProperty(itemKey)){
									let result = validate(itemKey, schema[key][i][itemKey], schema[key][i], udo[i])
									if(!result) return result
								}
								else if(validateKey.booleanLogic.hasOwnProperty(itemKey)){
									let result = validate(validateKey.list.booleanLogic, itemKey, schema[key][i], udo[i])
									if(!result) return result
								}
							}
						}
					}
				}
				else {
					if(typeof(schema[validateKey.type.array.additionalItems]) === validateKey.type.list.object){
						for(let i=0; i<udo.length; i++){
							if(schema[key][i]){
								for(let itemKey in schema[key][i]){
									if(validateKey.list.hasOwnProperty(itemKey)){
										let result = validate(itemKey, schema[key][i][itemKey], schema[key][i], udo[i])
										if(!result) return result
									}
									else if(validateKey.booleanLogic.hasOwnProperty(itemKey)){
										let result = validate(validateKey.list.booleanLogic, itemKey, schema[key][i], udo[i])
										if(!result) return result
									}
								}
							}
							else {
								for(let itemKey in schema[validateKey.type.array.additionalItems]){
									if(validateKey.list.hasOwnProperty(itemKey)){
										let result = validate(itemKey, schema[validateKey.type.array.additionalItems][itemKey], schema[validateKey.type.array.additionalItems], udo[i])
										if(!result) return result
									}
									else if(validateKey.booleanLogic.hasOwnProperty(itemKey)){
										let result = validate(validateKey.list.booleanLogic, itemKey, schema[validateKey.type.array.additionalItems], udo[i])
										if(!result) return result
									}
								}
							}
						}
					}
					else return false
				}
				return true
			}
			else {
				for(let i=0; i<udo.length; i++){
					for(let itemKey in schema[key]){
						if(validateKey.list.hasOwnProperty(itemKey)){
							let result = validate(itemKey, schema[key][itemKey], schema[key], udo[i])
							if(!result) return result
						}
						else if(validateKey.booleanLogic.hasOwnProperty(itemKey)){
							let result = validate(validateKey.list.booleanLogic, itemKey, schema[key], udo[obj])
							if(!result) return result
						}
					}
				}
				return true
			}

		case validateKey.type.array.maxItems:
			if(udo.length <= schema[key]) return true
			else return false

		case validateKey.type.array.minItems:
			if(udo.length >= schema[key]) return true
			else return false

		case validateKey.type.array.uniqueItems:
			let counter = {}
			udo.forEach(function(obj) {
		    var key = JSON.stringify(obj)
		    counter[key] = (counter[key] || 0) + 1
			})
			counter = Object.values(counter)
			for(let i=0; i<counter.length; i++){
				if(counter[i] > 1) return false
			}
			return true

		case validateKey.type.array.contains:
			for(let i=0; i<udo.length; i++){
				for(let itemKey in schema[key]){
					if(validateKey.list.hasOwnProperty(itemKey)){
						let result = validate(itemKey, schema[key][itemKey], schema[key], udo[i])
						if(result) return result
					}
					else if(validateKey.booleanLogic.hasOwnProperty(itemKey)){
						let result = validate(validateKey.list.booleanLogic, itemKey, schema[key], udo[i])
						if(!result) return result
					}
				}
			}

			return false

		default:
			return true
	}
}

const validateObject = (key, schema, udo, propertyName) => {
	switch(key) {
		case validateKey.type.object.maxProperties:
			var size = Object.keys(udo).length
			if(size <= schema[key]) return true
			else return false

		case validateKey.type.object.minProperties:
			var size = Object.keys(udo).length
			if(size >= schema[key]) return true
			else return false

		case validateKey.type.object.properties:
			for(let obj in udo){
				if(schema[key][obj]){
					for(let otherKey in schema[key][obj]){
						if (validateKey.list.hasOwnProperty(otherKey)){
							let result = validate(otherKey, schema[key][obj][otherKey], schema[key][obj], udo[obj], obj)
							if(!result) return result
						}
						else if(validateKey.booleanLogic.hasOwnProperty(otherKey)){
							let result = validate(validateKey.list.booleanLogic, otherKey, schema[key][obj], udo[obj], obj)
							if(!result) return result
						}
					}
				}
				else if(schema[validateKey.type.object.additionalProperties]) {
					for(let otherKey in schema[validateKey.type.object.additionalProperties]){
						if (validateKey.list.hasOwnProperty(otherKey)){
							let result = validate(otherKey, schema[validateKey.type.object.additionalProperties][otherKey], schema[validateKey.type.object.additionalProperties], udo[obj], obj)
							if(!result) return result
						}
						else if(validateKey.booleanLogic.hasOwnProperty(otherKey)){
							let result = validate(validateKey.list.booleanLogic, otherKey, schema[validateKey.type.object.additionalProperties], udo[obj], obj)
							if(!result) return result
						}
					}
				}
			}
			return true

		case validateKey.type.object.patternProperties:
			for(let obj in udo){
				let patternResult = false
				for(let patternObj in schema[key]){
					patternResult = validateString(validateKey.type.string.pattern, patternObj, obj)
					if(patternResult){
						for(let otherKey in schema[key][patternObj]){
							if (validateKey.list.hasOwnProperty(otherKey)){
								let result = validate(otherKey, schema[key][patternObj][otherKey], schema[key][patternObj], udo[obj], obj)
								if(!result) return result
							}
							else if(validateKey.booleanLogic.hasOwnProperty(otherKey)){
								let result = validate(validateKey.list.booleanLogic, otherKey, schema[key][patternObj], udo[obj], obj)
								if(!result) return result
							}
						}
						break
					}
				}
				if(!patternResult && schema[validateKey.type.object.additionalProperties]){
					for(let otherKey in schema[validateKey.type.object.additionalProperties]){
						if (validateKey.list.hasOwnProperty(otherKey)){
							let result = validate(otherKey, schema[validateKey.type.object.additionalProperties][otherKey], schema[validateKey.type.object.additionalProperties], udo[obj], obj)
							if(!result) return result
						}
						else if(validateKey.booleanLogic.hasOwnProperty(otherKey)){
							let result = validate(validateKey.list.booleanLogic, otherKey, schema[validateKey.type.object.additionalProperties], udo[obj], obj)
							if(!result) return result
						}
					}
				}
			}

		case validateKey.type.object.required:
			for(let i=0; i<schema[key].length; i++){
				if(_.hasIn(udo, schema[key][i])) return true
				else return false
			}

		case validateKey.type.object.dependencies:
			for(let obj in schema[key]){
				if(_.hasIn(udo, obj)){
					if(Array.isArray(schema[key][obj])){
						for(let i=0;i<schema[key][obj].length; i++){
							if(!_.hasIn(udo, schema[key][obj][i])) return false
						}
					}
					else {
						for(let otherKey in schema[key][obj]){
							let result = validateObject(otherKey, schema[key][obj], udo)
							if(!result) return result
						}
					}
				}
			}
			return true

		case validateKey.type.object.propertyNames:
			for(let otherKey in schema[key]){
				let result = validateString(otherKey, schema[key][otherKey], propertyName)
				if(!result) return result
			}
			return true

		default:
			return true
	}
}

const validate = (key, keyValue, schema, udo, propertyName='') => {
	switch(key) {
		case validateKey.list.type:
			switch(keyValue) {
		    case validateKey.type.list.number:
		      if (typeof(udo) === validateKey.type.list.number){
		      	for(let otherKey in schema) {
		      		let result = validateNumber(otherKey, schema[otherKey], udo)
		      		if(!result) return result
		      	}
		      	return true
		      }
		      else return false

		    case validateKey.type.list.integer:
		      if (Number.isInteger(udo)){
		      	for(let otherKey in schema) {
		      		let result = validateNumber(otherKey, schema[otherKey], udo)
		      		if(!result) return result
		      	}
		      return true
		      }
		      else return false

				case validateKey.type.list.string:
		      if (typeof(udo) === validateKey.type.list.string){
		      	for(let otherKey in schema) {
		      		let result = validateString(otherKey, schema[otherKey], udo)
		      		if(!result) return result
		      	}
		      	return true
		      }
		      else return false
				
				case validateKey.type.list.array:
					if (Array.isArray(udo)){
		      	for(let otherKey in schema) {
		      		let result = validateArray(otherKey, schema, udo)
		      		if(!result) return result
		      	}
		      	return true
		      }
		      else return false

				case validateKey.type.list.object:
		      if (typeof(udo) === validateKey.type.list.object){
		      	for(let otherKey in schema) {
		      		let result = validateObject(otherKey, schema, udo, propertyName)
		      		if(!result) return result
		      	}
		      	return true
		      }
		      else return false

		    default:
		      return true
			}

		case validateKey.list.enum:
			if(_.indexOf(keyValue, udo) === -1) return false;
			else return true

		case validateKey.list.const:
			if(keyValue !== udo) return false;
			else return true

		case validateKey.list.booleanLogic:
			switch(keyValue){
				case validateKey.booleanLogic.allOf:

				case validateKey.booleanLogic.anyOf:
					for(let obj in udo){
						for(let i=0; i<schema[validateKey.booleanLogic.anyOf].length; i++){
							for(let otherKey in schema[validateKey.booleanLogic.anyOf][i]){
								if(validateKey.list.hasOwnProperty(otherKey)){
									let result = validate(otherKey, schema[validateKey.booleanLogic.anyOf][i][otherKey], schema[validateKey.booleanLogic.anyOf][i], udo[obj], obj)
									if(result) return result
								}
								else if(validateKey.booleanLogic.hasOwnProperty(otherKey)){
									let result = validate(validateKey.list.booleanLogic, otherKey, schema[validateKey.booleanLogic.anyOf][i], udo[obj], obj)
									if(!result) return result
								}
							}
						}
					}
					return false

				case validateKey.booleanLogic.oneOf:

				case validateKey.booleanLogic.not:

				default:
					return true
			}

		default:
			return true
	}

	return true
}

const udoValidate = (udo, schema) => {

	udo = { json: udo }
	schema = { json: schema }
	for(let obj in udo){
		if(schema[obj]){
			for(let key in schema[obj]){
				if (validateKey.list.hasOwnProperty(key)){
					let result = validate(key, schema[obj][key], schema[obj], udo[obj], obj)
					if(!result) return result
				}
				else if(validateKey.booleanLogic.hasOwnProperty(key)){
					let result = validate(validateKey.list.booleanLogic, key, schema[obj], udo[obj])
					if(!result) return result
				}
			}
		}
	}
	return true

}

module.exports = udoValidate