//~ Prend une liste de coup comme argument et renvoi :
//~ 0 si la liste de coups est valide
//~ 1 si la liste est invalide
//~ 2 si la liste est valide mais que la partie est terminée

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

if (chess.game_over()) {
	process.exit(2);
}

process.exit(0);
