const udoReconcile = (udo, criteria) => {
	
	var nested = [];
	var reason = [];
	var reconciled = true;

	var data = {
		criData : criteria,
		cmpData : udo
	}
	nested.push (data);

	var objectConstructor = {}.constructor;

	while(nested.length > 0) {
		
		var item = nested.shift();
		var criData = item.criData;
		var cmpData = item.cmpData;
		
		for (var key in criData) {
			if (cmpData.hasOwnProperty(key)) {
				if ( criData[key].constructor === objectConstructor ) {
					nested.push({
						criData: criData[key],
						cmpData: cmpData[key]
					});
				}
			} else {
				reconciled = false;
				reason.push(key)
			}
		}
	}

	var result = { reconciled: reconciled, reason: reason};
	return result
}

module.exports = udoReconcile