var util = require('util'),
	ch =  require('./chess'),
	chess = new ch.Chess();

process.argv.forEach(
	function(val, index, array) {
		if (index > 1) {
			if (chess.move(val) == null) {
				process.exit(1);
			}
		}
	}
);

process.exit(0);
