const _ = require('lodash');

const validateKeyWords = {
	"type":1,
	"enum":1,
	"const":1,
	"multipleOf":2,
	"maximum":2,
	"exclusiveMaximum":2,
	"minimum":2,
	"exclusiveMinimum":2,
	"maxLength":3,
	"minLength":3,
	"pattern":3,
	"items":4,
	"additionalItems":4,
	"maxItems":4,
	"minItems":4,
	"uniqueItems":4,
	"contains":4,
	"maxProperties":5,
	"minProperties":5,
	"required":5,
	"properties":5,
	"patternProperties":5,
	"dependencies":5,
	"propertyNames":5,
	"if":6,
	"allOf":7,
	"anyOf":7,
	"oneOf":7,
	"not":7
}

const anyInstanceTypeValidate = (validateKey, udo, schema) => {
	if(validateKey === "type"){
		if(schema === "number"){
			if (typeof(udo) === schema) return true
      else return false
		}
		else if(schema === "integer"){
			if (Number.isInteger(udo)) return true
      else return false
		}
		else if(schema === "string"){
			if (typeof(udo) === schema) return true
			else return false
		}
		else if(schema === "array"){
			if (Array.isArray(udo)) return true
		  else return false
		}
		else if(schema === "object"){
			if (typeof(udo) === schema) return true
		  else return false
		}
		else if(schema === "boolean"){
			if (typeof(udo) === schema) return true
		  else return false
		}
		else if(schema === "null"){
			if (udo === schema) return true
		  else return false
		}
	}
	else if(validateKey === "enum"){
		if(_.indexOf(schema, udo) > -1) return true;
		else return false
	}
	else if(validateKey === "const"){
		if(schema === udo) return true
		else return false
	}

	return true
}
const numberValidate = (validateKey, udo, schema) => {
	if(validateKey === "multipleOf"){
		if(Number.isInteger(udo/schema)) return true
		else return false
	}
	else if(validateKey === "multipleOf"){
		if(udo <= schema) return true
		else return false
	}
	else if(validateKey === "maximum"){
		if(udo <= schema) return true
		else return false
	}
	else if(validateKey === "exclusiveMaximum"){
		if(udo < schema) return true
		else return false
	}
	else if(validateKey === "minimum"){
		if(udo >= schema) return true
		else false
	}
	else if(validateKey === "exclusiveMinimum"){
		if(udo > schema) return true
		else return false
	}

	return true
}
const stringValidate = (validateKey, udo, schema) => {
	if(validateKey === "maxLength"){
		if(udo.length <= schema) return true
		else return false
	}
	else if(validateKey === "minLength"){
		if(udo.length >= schema) return true
		else return false
	}
	else if(validateKey === "pattern"){
		var found = udo.match(schema);
		if(found) return true
		else return false
	}

	return true
}
const arrayValidate = (validateKey, udo, schema, schemaAll) => {
	if(validateKey === "items"){
		if(Array.isArray(schema)) {
			if(udo.length <= schema.length || !schemaAll["additionalItems"]){
				for(let i=0; i<udo.length; i++){
					if(schema[i]){
						for(let key in schema[i]){
							if (validateKeyWords.hasOwnProperty(key)){
								const all = schema[i]
								let result = selectValidateFuntion(validateKeyWords[key], key, udo[i], schema[i][key], all)
								if(!result) return result
							}
						}
					}
				}
			}
			else {
				if(typeof(schemaAll["additionalItems"]) === "object"){
					for(let i=0; i<udo.length; i++){
						if(schema[i]){
							for(let key in schema[i]){
								if (validateKeyWords.hasOwnProperty(key)){
									const all = schema[i]
									let result = selectValidateFuntion(validateKeyWords[key], key, udo[i], schema[i][key], all)
									if(!result) return result
								}
							}
						}
						else {
							for(let key in schemaAll["additionalItems"]){
								if (validateKeyWords.hasOwnProperty(key)){
									const all = schema[i]
									let result = selectValidateFuntion(validateKeyWords[key], key, udo[i], schemaAll["additionalItems"][key], all)
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
				for(let key in schema[i]){
					if (validateKeyWords.hasOwnProperty(key)){
						const all = schema[i]
						let result = selectValidateFuntion(validateKeyWords[key], key, udo[i], schema[i][key], all)
						if(!result) return result
					}
				}
			}
			return true
		}
	}
	else if(validateKey === "maxItems"){
		if(udo.length <= schema) return true
		else return false
	}
	else if(validateKey === "minItems"){
		if(udo.length >= schema) return true
		else return false
	}
	else if(validateKey === "uniqueItems"){
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
	}
	else if(validateKey === "contains"){
		for(let i=0; i<udo.length; i++){
			for(let key in schema){
				if (validateKeyWords.hasOwnProperty(key)){
					const all = schema
					let result = selectValidateFuntion(validateKeyWords[key], key, udo[i], schema[key], all)
					if(result) return result
				}
			}
		}

		return false
	}

	return true
}
const objectValidate = (validateKey, udo, schema, schemaAll) => {
	if(validateKey === "maxProperties"){
		if(Object.keys(udo).length <= schema) return true
		else return false
	}
	else if(validateKey === "minProperties"){
		if(Object.keys(udo).length >= schema) return true
		else return false
	}
	else if(validateKey === "required"){
		for(let i=0; i<schema.length; i++){
			if(_.hasIn(udo, schema[i])) return true
			else return false
		}
	}
	else if(validateKey === "properties" || validateKey === "patternProperties" || validateKey === "additionalProperties"){
		for(let obj in udo){
			objMatch = false
			if(schemaAll["properties"][obj]){
				objMatch = true
				for(let key in schemaAll["properties"][obj]){
					if (validateKeyWords.hasOwnProperty(key)){
						const all = schemaAll["properties"][obj]
						let result = selectValidateFuntion(validateKeyWords[key], key, udo[obj], schemaAll["properties"][obj][key], all)
						if(!result) return result
					}
				}
			}
			if(!objMatch && schemaAll["patternProperties"]) {
				let patternResult = false
				for(let patternObj in schemaAll["patternProperties"]){
					patternResult = stringValidate("pattern", patternObj, obj)
					if(patternResult){
						objMatch = true
						for(let key in schemaAll["patternProperties"][patternObj]){
							if (validateKeyWords.hasOwnProperty(key)){
								const all = schemaAll["patternProperties"][patternObj]
								let result = selectValidateFuntion(validateKeyWords[key], key, udo[obj], schemaAll["patternProperties"][patternObj][key], all)
								if(!result) return result
							}
						}
					}
				}
			}
			if(!objMatch && schemaAll["additionalProperties"]) {
				for(let key in schemaAll["additionalProperties"]){
					if (validateKeyWords.hasOwnProperty(key)){
						const all = schemaAll["additionalProperties"]
						let result = selectValidateFuntion(validateKeyWords[key], key, udo[obj], schemaAll["additionalProperties"][key], all)
						if(!result) return result
					}
				}
			}
		}
		return true
	}
	else if(validateKey === "dependencies"){
		for(let obj in schema){
			if(_.hasIn(udo, obj)){
				if(Array.isArray(schema[obj])){
					for(let i=0;i<schema[obj].length; i++){
						if(!_.hasIn(udo, schema[obj][i])) return false
					}
				}
				else {
					for(let key in schema[obj]){
						if (validateKeyWords.hasOwnProperty(key)){
							const all = schema[obj]
							let result = selectValidateFuntion(validateKeyWords[key], key, udo, schema[obj][key], all)
							if(!result) return result
						}
					}
				}
			}
		}

		return true
	}
	else if(validateKey === "propertyNames"){
		for(let obj in udo){
			for(let key in schema){
				if (validateKeyWords.hasOwnProperty(key)){
					let result = selectValidateFuntion(validateKeyWords[key], key, obj, schema[key])
					if(!result) return result
				}
			}
		}

		return true
	}

	return true
}
const conditionValidate = (validateKey, udo, schema, schemaAll) => {
	let validateArr = []
	for(let key in schema){
		if (validateKeyWords.hasOwnProperty(key)){
			const all = schema
			let result = selectValidateFuntion(validateKeyWords[key], key, udo, schema[key], all)
			validateArr.push(result)
		}
	}
	if(_.indexOf(validateArr, false) === -1){
		if(schemaAll["then"]){
			for(let key in schemaAll["then"]){
				if(validateKeyWords.hasOwnProperty(key)){
					const all = schemaAll["then"]
					let result = selectValidateFuntion(validateKeyWords[key], key, udo, schemaAll["then"][key], all)
					if(!result) return false
				}
			}
			return true
		}
		return true
	}
	else {
		if(schemaAll["else"]){
			for(let key in schemaAll["else"]){
				if (validateKeyWords.hasOwnProperty(key)){
					const all = schemaAll["else"]
					let result = selectValidateFuntion(validateKeyWords[key], key, udo, schemaAll["else"][key], all)
					if(!result) return false
				}
			}
			return true
		}
		return true
	}
}
const booleanLogicValidate = (validateKey, udo, schema) => {
	if(validateKey === "allOf"){
		let validateCnt = 0
		for(let i=0; i<schema.length; i++){
			let validateArr = []
			for(let key in schema[i]){
				if (validateKeyWords.hasOwnProperty(key)){
					const all = schema[i]
					let result = selectValidateFuntion(validateKeyWords[key], key, udo, schema[i][key], all)
					validateArr.push(result)
				}
			}
			if(_.indexOf(validateArr, false) === -1){
				validateCnt++
			}
		}
		if(validateCnt == schema.length) return true
		else return false
	}
	else if(validateKey === "anyOf"){
		let validateCnt = 0
		for(let i=0; i<schema.length; i++){
			let validateArr = []
			for(let key in schema[i]){
				if (validateKeyWords.hasOwnProperty(key)){
					const all = schema[i]
					let result = selectValidateFuntion(validateKeyWords[key], key, udo, schema[i][key], all)
					validateArr.push(result)
				}
			}
			if(_.indexOf(validateArr, false) === -1){
				validateCnt++
			}
		}
		if(validateCnt > 0) return true
		else return false
	}
	else if(validateKey === "oneOf"){
		let validateCnt = 0
		for(let i=0; i<schema.length; i++){
			let validateArr = []
			for(let key in schema[i]){
				if (validateKeyWords.hasOwnProperty(key)){
					const all = schema[i]
					let result = selectValidateFuntion(validateKeyWords[key], key, udo, schema[i][key], all)
					validateArr.push(result)
				}
			}
			if(_.indexOf(validateArr, false) === -1){
				validateCnt++
			}
		}
		if(validateCnt == 1) return true
		else return false
	}
	else if(validateKey === "not"){
		let validateCnt = 0
		for(let i=0; i<schema.length; i++){
			let validateArr = []
			for(let key in schema[i]){
				if (validateKeyWords.hasOwnProperty(key)){
					const all = schema[i]
					let result = selectValidateFuntion(validateKeyWords[key], key, udo, schema[i][key], all)
					validateArr.push(result)
				}
			}
			if(_.indexOf(validateArr, false) === -1){
				validateCnt++
			}
		}
		if(validateCnt == 0) return true
		else return false
	}
}

const selectValidateFuntion = (keyKind, validateKey, udo, schema, schemaAll = {}) => {
	if(keyKind === 1) {
		return anyInstanceTypeValidate(validateKey, udo, schema)
	}
	else if(keyKind === 2) {
		return numberValidate(validateKey, udo, schema)
	}
	else if(keyKind === 3) {
		return stringValidate(validateKey, udo, schema)
	}
	else if(keyKind === 4) {
		return arrayValidate(validateKey, udo, schema, schemaAll)
	}
	else if(keyKind === 5) {
		return objectValidate(validateKey, udo, schema, schemaAll)
	}
	else if(keyKind === 6) {
		return conditionValidate(validateKey, udo, schema, schemaAll)
	}
	else if(keyKind === 7) {
		return booleanLogicValidate(validateKey, udo, schema)
	}

	return true
}

const udoValidate = (udo, schema) => {

	udo = { json: udo }
	schema = { json: schema }
	
	for(let obj in udo){
		if(schema[obj]){
			for(let key in schema[obj]){
				if (validateKeyWords.hasOwnProperty(key)){
					const all = schema[obj]
					let result = selectValidateFuntion(validateKeyWords[key], key, udo[obj], schema[obj][key], all)
					if(!result) return result
				}
			}
		}
	}

	return true
}

module.exports = udoValidate