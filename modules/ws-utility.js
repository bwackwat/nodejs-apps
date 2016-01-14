function sanitizeForMongoDB(v){
	if(v instanceof Object){
		for(var key in v){
			if(/^\$/.test(key)){
				delete v[key];
			}else if(v[key] instanceof Object){
				sanitizeForMongoDB(v[key]);
			}
		}
	}
	return v;
}

exports.serialize = function(data){
	return JSON.stringify(data);
};

exports.deserialize = function(data){
	return sanitizeForMongoDB(JSON.parse(data));
};