const udoValidate = (udo, schema) => {
	var Arr = [[schema, udo]]
	var st =0, ed = 1;
	var beInclude = true;
	while (st == ed){
		Arr[st][0].forEach((key)=> {
			if(Arr[st][1].include(key)) {
				Arr[ed]=[key,Arr[st][1].key];
				ed++;
			} else {
				beInclude = false;
				break;
			}
		})
		st++;
	}
	return beInclude
}
module.exports = udoValidate
