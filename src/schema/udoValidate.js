const Immutable = require('seamless-immutable')

const udoValidate = (udo, schema) => {

	let result = true

	var nested = [];

	var data = {
		schema : schema,
		cmpData : udo
	}
	nested.push (data);

	const validate = (key, schema, udo) => {

		// property type validate
		if(key === "type"){
			if(!typeof(udo) === schema) return false;
		}

		// property pattern validate
		if(key === "pattern"){
			var found = udo.match(schema);
			if(!found) return false;
		}

		// property exclusiveMinimum validate
		if(key === "exclusiveMinimum"){
			if(udo < schema) return false;
		}

		// property mininum validate
		if(key === "minimum"){
			if(udo <= schema) return false;
		}

		// property maxinum validate
		if(key === "maximum"){
			if(udo >= schema) return false;
		}

		// property enum validate
		if(key === "enum"){
			if(Immutable.getIn(schema, udo)) return false;
		}

		return true;

	}

	var objectConstructor = {}.constructor;

	while(nested.length > 0) {
		
		var item = nested.shift();
		var schema = item.schema;
		var cmpData = item.cmpData;

		for (var obj in cmpData) {

			if(schema[obj]){
				for (var key in schema[obj]){
					result = validate(key, schema[obj][key], cmpData[obj])
					if(!result) return result
				}
			}

			if(result){
				if ( cmpData[obj].constructor === objectConstructor ) {
					nested.push({
						schema: schema[obj].properties,
						cmpData: cmpData[obj]
					});
				}
			}
		}
		
	}

	return result

}

module.exports = udoValidate