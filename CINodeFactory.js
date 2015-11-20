var uniqueid = require('uniqueid');

function CINodeFactory() {
	this.fakeTime = 0;
};

CINodeFactory.prototype.create = function(typeName) {
	return {
		id: uniqueid({prefix: typeName + '_'}),
		data: {
			time: this.fakeTime++,
			type: typeName,
		}
	};
};

exports.CINodeFactory = CINodeFactory;
