player_color = 'white';
players = '';
DATE = '';
position = {};
prefs = ['ccn', 'ccb', 'pieces', 'size'];
historique = [];
selectColor = "#FF0000";
try_get_local_login();
game_ID = try_get_session('gid');
old_one_move = '';
tr = {'win' : 'parties gagnées',
	'lose' : 'parties perdues',
	'nul' : 'parties nulles',
	'not_finish' : 'parties en cours',
	'total' : 'Total'};
selection = {
	coord : '',
	color : '',
	html : '',
	piece : ''};
deselect();
PROMOTION = null;
COUP_PROMOTION = null;
INITIAL_POSITION = {'h' : [], 'c' : []};
MODE_PATRON = false;

function $(x) {
	return document.getElementById(x);
}

function try_get_local(v) {
	try {
		return localStorage.getItem(v);
	} catch (err) {
		return '';
	}
}

function try_set_local(k, v) {
	try {
		localStorage.setItem(k, v);
	} catch (err) {
		console.log('Impossible de stocker ' + v);
	}
}

function try_get_session(v) {
	try {
		return sessionStorage.getItem(v);
	} catch (err) {
		return '';
	}
}

function try_set_session(k, v) {
	try {
		sessionStorage.setItem(k, v);
	} catch (err) {
		console.log('Impossible de stocker ' + v);
	}
}

function switch_color(c) {
	if (c == 'white') {
			return 'black';
		} 
	else {
		return 'white';
	}
}

function nextligne(l, inverse) {
	if (inverse == false) {
		if (l == 8) return 1;
		return l + 1;
	} else {
		if (l == 1) return 8;
		return l - 1;
	}
}

function switch_color_ascii(color) {
	if (color == '') {
		return 'style="background : #D4D4D4"';
	} else {
		return '';
	}
}

function draw_board_ascii() {
	var e = $('board');
	var t = '<table>';
	var colonne = '';
	var color = ' ';
	if (player_color == 'white') {
		for (var x = 8; x > 0; x--) {
			t += '<tr><td>' + x + '</td>';
			for (var y = 1; y < 9; y++) {
				colonne = String.fromCharCode(y + 96);
				color = switch_color_ascii(color);
				t += '<td ' + color + '>' + piece_to_image_all(position[colonne + x]) + '</td>';
			}
			t += '</tr>';
			color = switch_color_ascii(color);
		}
	} else {
		for (var x = 1; x < 9; x++) {
		t += '<tr><td>' + x + '</td>';
			for (var y = 8; y > 0; y--) {
				colonne = String.fromCharCode(y + 96);
				color = switch_color_ascii(color);
				t += '<td ' + color + '>' + piece_to_image_all(position[colonne + x]) + '</td>';
			}
		t += '</tr>';
		color = switch_color_ascii(color);
		}
	}
	t += '<tr><td></td>';
	if (player_color == 'white') {
		for (var y = 1; y < 9; y++) {
			colonne = String.fromCharCode(y + 96);
			t += '<td>' + colonne + '</td>';
		}
	} else {
		for (var y = 8; y > 0; y--) {
			colonne = String.fromCharCode(y + 96);
			t += '<td>' + colonne + '</td>';
		}
	}
	t += '</tr></table>';
	e.style.background = 'white';
	e.innerHTML = t;
}

function draw_board() {
	resize();
	var e = $('board');
	var t = '';
	var cases_lettres = [];
	var cases_chiffres = [];
	if (player_color == 'white') {
		var colonne = 1;
		var ligne = 8;
	} else {
		var colonne = 8;
		var ligne = 1;
	}
	var color = 'white';
	for (var i = 1; i < 9; i++) {
		cases_lettres.push(i);
		cases_lettres.push(i + 90);
	}
	for (i = 1; i < 9; i++) {
		cases_chiffres.push(i * 10);
		cases_chiffres.push(i * 10 + 9);
	}
	for(i = 0; i < 100 ; i++) {
		var classe='case';
		var valeur = '';
		var id = 'case_' + i;
		if ([0, 9, 90, 99].indexOf(i) > -1) {
			classe += ' rien';
		}
		if (cases_lettres.indexOf(i) > -1) {
			classe += ' coord';
			var c = i;
			if (c > 10) c -= 90;
			if (player_color == 'white') {
				valeur = String.fromCharCode(c + 96);
			} else {
				valeur = String.fromCharCode(9 - c + 96);
			}
			valeur = '<p>' + valeur + '</p>';
		}
		if (cases_chiffres.indexOf(i) > -1) {
			classe += ' coord';
			var l = i;
			if (l % 2 !== 0) l -= 9;
			if (player_color == 'black') {
				valeur = l / 10;
			} else {
				valeur = 9 - (l / 10);
			}
			valeur = '<p>' + valeur + '</p>';
		}
		if ( (i > 10) && (i < 89) && (i % 10 !== 0) && ((i + 1) % 10 !== 0)) {
			var id = String.fromCharCode(colonne + 96) + ligne;
			var sens = true;
			if (player_color == 'black') { 
				sens = !sens;
			}
			colonne = nextligne(colonne, !sens);
			classe += ' ' + color;
			color = switch_color(color);
			if (player_color == 'white') {
				if (colonne == 1) {
					color = switch_color(color);
					ligne = nextligne(ligne, sens);
				}
			} else {
				if (colonne == 8) {
					color = switch_color(color);
					ligne = nextligne(ligne, sens);
				}
			}
		}
		elt = "<div onclick=f_click('" + id + "'); class='" + classe + "' id='" + id + "'>" + valeur + "</div>";
		t = t + elt;
	}
	e.innerHTML = t;
	draw_color_case();
}

function draw_color_case() {
	var cc = ['ccb', 'ccn'];
	var ec = ['white', 'black'];
	for (var j = 0; j < 2; j++ ) {
		var case_color = try_get_local(cc[j]);
		if (case_color != '' ||case_color != null) {
			var e = document.getElementsByClassName(ec[j]);
			for ( i = 0; i < e.length ; i++) { 
				e[i].style.backgroundColor = case_color;
			}
		}
	}
}
	
function get_type_pieces() {
	var tp = try_get_local("pieces");
	if (tp == null || tp == '' || tp == 'classic' || tp == 'null') {
		tp = '';
	}
	return tp;
}
	
function get_cdn() {
	var cdn = try_get_local("cdn");
	if (cdn == null || cdn.substr(0, 4) != 'http') {
		cdn = '';
	}
	return cdn;
}

function draw_pieces(p) {
	if (MODE_PATRON == true) {
		draw_board_ascii();
		return;
	}
	for(var i in p) {
		var id = i + '';
		var e = $(id);
		if (e != null) {
			if (p[id] == '') {
				e.innerHTML = '';
			} else {
				e.innerHTML = '<img class="pieces" src="' + get_cdn() + './pieces/' + get_type_pieces() + '/' + p[id] + '.png"</>';
			}
		}
	}
}

function clear_position() {
	CHESS.clear();
	position = CHESS.position();
}

function init_position() {
	CHESS = new Chess();
	position = CHESS.position();
}

function init_return(v) {
	try {
		var j = JSON.parse(v);
		player_color = j.color;
		players = j.players;
		DATE = j.date;
	} catch (err) {
		console.log('La récupération des informations de la partie a échouée');
	}
	console.log('game :', game_ID);
	console.log('color :', player_color);
	console.log('joueurs :', players);
	console.log('date :', DATE);
	f_reload();
}

function init() {
	var e = $('load');
	if (e != null) {
		e.parentNode.removeChild(e);
	}
	if (game_ID == '') {
		game_ID = try_get_session("gid");
	}
	if (game_ID == null) {
		game_ID = '';
	}
	var param = location.search.split('=')[0];
	if (param == '?gid') {
		game_ID = location.search.split('=')[1];
		try_set_session("gid", game_ID);
	} 
	if (game_ID != '') {
		get_page('/game_info.py?g=' + game_ID, 'init_return');
	} else {
		f_option();
	}
	//~ if (player_color == 'black') {
		//~ draw_board();
		//~ draw_pieces(position);
	//~ }
	draw_board();
	init_position();
	draw_pieces(position);
	historique = [];
	log = '';
}

function min_size() {
	var w = window.innerWidth - 35;
	var h = window.innerHeight - 20;
	return Math.min(h, w);
}

function finish_return(r) {
	if ( r == 'ok') {
		f_reload();
	} else {
		clean_log(r);
	}
}

function finish(i) {
	if (confirm("AVERTISSEMENT : cette action est définitive ! Voulez-vous continuer ?")) {
		get_page('/finish.py?g=' + game_ID + '&token=' + INITIAL_POSITION.nulle, 'finish_return'); 
	}
}

function resize() {
	var min = min_size();
	var e = $('board');
	var marge = try_get_local('size');
	if (marge == null || marge == 'null' || marge == '') {
		marge = 0;
	}
	min = min + parseInt(marge);
	e.style.width = min;
	e.style.height = min;
	e = $('gui');
	e.style.width = window.innerWidth - min - 45;
}

function getPieceFromHtml(t) {
	try {
		return t.split('/pieces/')[1].split('/')[1].split('.png')[0];
	} catch (err) {
		return '';
	}
}

function add_log(text) {
	var l = $('log');
	l.style.textAlign = "right";
	l.innerHTML += '<div class="llog">' + text + '</div>';
	log = l.innerHTML;
	l.scrollTop = l.scrollHeight;
}

function clean_log(t) {
	var l = $('log');
	l.innerHTML = t;
	l.scrollTop = l.scrollHeight;
}

function dselect_one_move(id) {
	try {
		id.style.background = '#FFFFFF';
	}
	catch (err) {
		console.log('rien à déselectionner');
	}
}
	
function select_one_move(n) {
	dselect_one_move(old_one_move);
	var e = $( 'coup_' + n );
	e.style.background = '#D4D4D4';
	old_one_move = e;
	init_position();
	for (var i = 0; i <= n; i++) {
		CHESS.move(historique[i]);
	}
	position = CHESS.position();
	draw_pieces(position);
	set_game_info(true);
}

function list_check_com(h) {
	var l = h.c;
	var r = [];
	for (var i = 0; i < h.h.length; i++) {
		r[i] = false;
	}
	for (var i = 0; i < l.length; i++) {
		r[ l[i].n ] = true;
	}
	return r;
}

function message_or_not(b) {
	if (b) {
		return '<div onclick="info(_n_)" class="order" title="message"><img src="./img/msg16x16.png"></div>';
	}
	return '<div class="order hide">.</div>';
}

function piece_to_image(p) {
	var t = { 	'K' : '♔',
				'Q' : '♕',
				'R' : '♖',
				'B' : '♗',
				'N' : '♘' };
	for (var i in t) {
		var r = new RegExp(i, "g");
		p = p.replace(r, t[i]);
	}
	return p;
}

function piece_to_image_all(p) {
	var t = { 	'Rb' : '♔',
				'Db' : '♕',
				'Tb' : '♖',
				'Fb' : '♗',
				'Cb' : '♘', 
				'pb' : '♙',
				'Rn' : '♚',
				'Dn' : '♛',
				'Tn' : '♜',
				'Fn' : '♝',
				'Cn' : '♞', 
				'pn' : '♟',
				};
	for (var i in t) {
		var r = new RegExp(i, "g");
		p = p.replace(r, t[i]);
	}
	return p;
}

function historique2log(h) {
	clean_log('');
	var numero = 0;
	var t = '';
	var l = list_check_com(h);
	var m = '';
	var i = 0;
	var com = false;
	var llog = '';
	for (i = 0; i < h.h.length; i++) {
		t = "<div class='order' onclick=select_one_move(" + i + ") id=coup_" + i + ">" + piece_to_image(h.h[i]) + "</div>" + t;
		if (l[i] == true) {
			com = true;
		}
		if ( i % 2 == 0 ) {
			numero = i / 2 + 1;
		} else {
			m = message_or_not(com);
			llog += m.replace(/_n_/, numero) + t + '<div class="num">'+ numero + '</div>';
			llog += '<div class="msg" id="msg_' + numero + '"></div><div class="plate hide">.</div>';
			t = '';
			com = false;
		}
	}
	if ( i % 2 == 1 ) {
		m = message_or_not(l[i - 1]);
		llog += m.replace(/_n_/, numero) + "<div class='order'>...</div>" + t + '<div class="num">'+ numero + '</div>';
		llog += '<div class="msg" id="msg_' + numero + '"></div>';
	}
	clean_log(llog);
	if ( h.nulle != null) {
		add_log('<div class="msg">Votre adversaire vous propose la nulle.</div><div onclick="finish()" class="btn">Accepter</a></div>');
	}
	if ( h.r != null) {
		add_log("<b>" + h.r + "</b>");
	}
	if ( h.r == null && CHESS.in_draw() ) {
		add_log("<b>½-½</b>");
	}
}

function deselect() {
	var e = $(selection.coord);
	try {
		e.style.background = selection.color;
	} catch (error) { }
	selection = {
		coord : '',
		color : '',
		html : '',
		piece : ''
		};
}

function anim_stop() {
	try {
		clearInterval(INTERVAL_ID);
	} catch (err) {}
	var img = $('send_btn');
	img.style.opacity = 1;
}

function anim_send_btn() {
	var img = $('send_btn');
	var s = img.style;
	if (s.opacity == 1) {
		s.opacity = 0.4;
	} else {
		s.opacity = 1;
	}
}

function anim_start() {
	anim_stop();
	INTERVAL_ID = setInterval(anim_send_btn, 700);
}

function f_click(c) {
	var coup = {};
	var e = $(c);
	var e2 = $(selection.coord);
	if (!("case black" == e.className || "case white" == e.className)) {
		console.log('sélection hors du plateau');
		return 1;
	}
	if (getPieceFromHtml(e.innerHTML) == '' && selection.coord == '') {
		if (selection.piece == '') {
			console.log('sélection vide');
			return 2;
		}
	}
	if (selection.coord == c) {
		e2.style.background = selection.color;
		console.log('sélection identique');
		deselect();
		return 3;
	}
	if (selection.coord == '' && selection.piece == '') {
		selection.coord = c;
		selection.color = e.style.background;
		selection.html = e.innerHTML;
		selection.piece = getPieceFromHtml(e.innerHTML);
		e.style.background = selectColor;
	} else {
		coup.p1 = selection.piece;
		coup.c1 = selection.coord;
		coup.p2 = '';
		var arrive = getPieceFromHtml(e.innerHTML);
		if (arrive !== '') {
			coup.p2 = arrive;
		}
		coup.c2 = c;
		var m = { 'from' : selection.coord, 'to' : c };
		if (CHESS.move(m) == null) {
			if ((((c[1] == 8) && (selection.piece == 'pb')) || 
				((c[1] == 1) && (selection.piece == 'pn'))) &&
				(CHESS.in_check() == false) ) { // promotion
					if (((c[1] == 1) && (CHESS.history().length % 2 == 0)) || 
					((c[1] == 8) && (CHESS.history().length % 2 == 1))) {
						alert("Ce n'est pas à votre tour de jouer");
						deselect();
						return;
					}
					deselect();
					f_add();
					PROMOTION = m;
					COUP_PROMOTION = coup;
					return;
				}
			var message = 'Coup invalide ! ';
			if (CHESS.in_check()) {
				message = 'Attention, vous êtes en échec !';
			}
			alert(message);
			deselect();
			return;
		}
		if (coup.c1 !== '') {
			position[coup.c1] = '';
		}
		position[c] = selection.piece;
		historique = CHESS.history();
		historique2log({'h' : CHESS.history(), 'c' : INITIAL_POSITION.c});
		try {
			e2.style.background = selection.color;
			e2.innerHTML = '';
		} catch (error) {
		}
		e.innerHTML = selection.html;
		deselect();
		anim_start();
	}
	set_game_info(true);
	position = CHESS.position();
	draw_pieces(position);
}

function f_click_add(p) {
	var e = $(p);
	if (selection.piece !== '') {
		var e2 = $(selection.piece);
		e2.style.background = selection.color;
	}
	selection.coord = '';
	selection.color = e.style.background;
	selection.html = e.innerHTML;
	selection.piece = p;
	e.style.background = selectColor;
	if (PROMOTION != null ) {
		PROMOTION.promotion = transpose_piece_to_promotion(p);
		if (CHESS.move(PROMOTION) == null) {
			alert('Erreur lors de la promotion');
		} else {
			if (COUP_PROMOTION.c1 !== '') {
				position[COUP_PROMOTION.c1] = '';
			}
			position[COUP_PROMOTION.c2] = p;
			historique.push(CHESS.history().pop());
			historique2log({"h" : historique, "c" : INITIAL_POSITION.c});
			deselect();
			set_game_info(true);
			draw_pieces(position);
		}
	}
	PROMOTION = null;
	COUP_PROMOTION = null;
}

function transpose_piece_to_promotion(piece) {
	piece = piece[0];
	switch(piece) {
		case 'T' : p = 'r';
		break;
		case 'C' : p = 'n';
		break;
		case 'F' : p = 'b';
		break;
		case 'R' : p = 'k';
		break;
		case 'D' : p = 'q';
		break;
	}
	return p;
}

function f_add() {
	var e = $('log');
	e.style.textAlign = "left";
	var piece = ['T', 'C', 'F', 'D', 'R', 'p'];
	var c  ='';
	if (CHESS.history().length % 2 == 0) {
		c = 'b';
	} else {
		c = 'n';
	}
	var d = "<p>Promotion :</p>";
	for (var p in piece) {
		var nom = piece[p] + c;
		d += '<div id="' + nom + '" onclick=f_click_add("' + nom + '") class="case add white"><img class="pieces" src="' + get_cdn() + './pieces/' + get_type_pieces() + '/' + nom + '.png"</></div>';
	}
	d += '<br/>';
	e.innerHTML = d; 
	e = document.getElementsByClassName('add');
	var w = e[0].offsetWidth;
	for (var i =0; i < e.length; i++) {
		e[i].style.height = w;
	}
}

function build_menu(connected) {
	var m = {'se déconnecter' : 'logout',
		'mon compte' : 'account',
		'préférences' : 'preferences',
		'parties en cours' : 'games',
		'statistiques' : 'stats',
		'liste des joueurs' : 'players',
		'à propos' : 'about'};
	if (connected == false) {
		m = {'se connecter' : 'menu_login',
		'à propos' : 'about'};
	}
	return m;
}

function try_get_local_login() {
	user_ID = try_get_local("login");
}

function f_option() {
	set_game_info(false);
	var e = $("log");
	var t ='';
	var m = {};
	e.style.textAlign = "center";
	try_get_local_login();
	if (user_ID == null) {
		try_get_local_login();
	}
	if (user_ID == '' || user_ID == null) {
		get_login();
	}
	if (user_ID == '' || user_ID == null) {
		t = '<div id="login">(pensez à autoriser les cookies pour pouvoir vous connecter)</div>';
		m = build_menu(false);
	} else {
		t = '<div id="login">Vous êtes connecté en tant que : ' + user_ID + '</div>';
		m = build_menu(true);
	}
	t += '<div id="menu"> ';
	for (var i in m) {
		t += '<div class="btn" onclick=f_menu("' + m[i] + '")>' +  i + '</div>';
	}
	e.innerHTML = t + '</div>';
}

function check_rotate() {
	var e = $('case_10');
	if (e == null) { return; }
	if ((e.innerHTML == '<p>8</p>' && player_color == 'black')||
		(e.innerHTML == '<p>1</p>' && player_color == 'white')) {
		f_rotate();
	}
}

function f_init() {
	anim_stop();
	check_rotate();
	log = '';
	set_position(INITIAL_POSITION);
	deselect();
	set_game_info(true);
}

function nothing_return(x) {
	return;
}

function bug_report(gid) {
	get_page('/bug.py?g=' + gid, 'nothing_return');
}

function scores() {
	var valeur = { p : 1,
		D : 10,
		R : 0,
		F : 3,
		C : 3,
		T : 5 };
	var score = { n : 0, b : 0};
	for (var i in position) {
		var v = position[i];
		if (v != '') {
			score[v[1]] += valeur[v[0]];
		}
	}
	return score;
}

function set_game_info(aff) {
	var e=$('game_info');
	if (aff == false) {
		e.innerHTML = '';
		return;
	}
	var p = players.split(' vs ');
	if (p[1] == null) {
		p[0] = 'blancs';
		p[1] = 'noirs';
	}
	var s = scores();
	e.innerHTML = 'partie #' + game_ID + ' : ' + p[0] + ' (' + s.b + ') - ' + p[1] +  ' (' + s.n + ')' ;
}

function f_reload_return(j) {
	if (j == 'no data') {
		alert("Aucune donnée n'a pu être récupérée.");
		return 3;
	}
	if (j == '') {
		j = {};
	}
	try {
		var r = JSON.parse(j);
	} catch (err) {
		bug_report(game_ID);
		alert('La récupération de la liste des coups a échoué');
		console.log(j);
		return 4;
	}
	window.document.title = 'chess'; // midori ne rafraichi pas le titre sinon
	window.document.title = 'chess #' + game_ID + ' ' + players;
	INITIAL_POSITION = r;
	set_position(r);
	set_game_info(true);
}

function f_reload() {
	anim_stop();
	if (game_ID == '') {
		alert("aucune partie n'est sélectionnée.");
		return 2;
	}
	check_rotate();
	get_page('/history.py?g=' + game_ID + '&c=1', 'f_reload_return');
}

function f_rotate() {
	var pc = player_color;
	var e = $('case_10');
	if (e.innerHTML == '<p>8</p>') {
		player_color = 'black';
	} else {
		player_color = 'white';
	}
	draw_board();
	draw_pieces(position);
	player_color = pc;
}

function check_last_move(c) {
	if (c == '') { return true; }
	var test = new Chess();
	var h = INITIAL_POSITION.h;
	for (var i = 0; i < h.length; i++) {
		test.move(h[i]);
	}
	if (test.move(c) == null) {
		return false;
	} else {
		return true;
	}
}

function f_send() {
	anim_stop();
	clean_log('');
	var r = diff_historique();
	if (check_last_move(r) == false) {
		alert('Dernier coup invalide.');
		f_init();
		return;
	}
	var e = $('send_form_origin');
	var l = $('log');
	var txt = '<div id="send_form">';
	if (check_player_in_game() == false) {
		txt += "<p>Attention ! Vous n'êtes pas autorisé à jouer dans cette partie !</p>";
	}
	clean_log('');
	if (r == '') {
		txt += "Aucun coup n'a été joué";
	} else {
		txt += 'Le coup suivant va être envoyé :';
		txt += '<br/><br/>' + r + '<br/>';
	}
	l.innerHTML = txt + e.innerHTML + '</div>';
}

function diff_historique() {
	if (CHESS.history().length == INITIAL_POSITION.h.length) {
		return '';
	}
	return CHESS.history()[INITIAL_POSITION.h.length];
}

function set_position(h) {
	clean_log('INFORMATION : les coups que vous jouez ici sont considérés comme un «&nbsp;brouillon&nbsp;», il faut cliquer sur le bouton «&nbsp;envoyer&nbsp;» pour valider vos modifications.<hr/>');
	init_position();
	historique = [];
	var n = h.h.length;
	if (n == 0) {
		console.log("L'historique est vide");
	}
	for (var i = 0; i < n; i ++) {
		var coup = h.h[i];
		if (CHESS.move(coup) == null) {
			console.log('Erreur ! coup  ' + coup + ' invalide');
			coup = coup.replace(/\+/g, "%2B");
			coup = coup.replace(/#/g, "%23");
			get_page('/bug.py?g=' + game_ID + '&c=' + i + '%3D' + coup, 'nothing_return');
		} else {
			historique.push(h.h[i]);
		}
	}
	position = CHESS.position();
	draw_pieces(position);
	historique2log(h);
}

function get_page(name, fonction, add) {
	clean_log('En attente de la réponse...');
	var xhr = new XMLHttpRequest();
	var url = name.split('?')[0];
	var params = name.split('?')[1];
	try {
		xhr.open('POST', url, true); // true = asynchrone
	}
	catch (error) {
		console.log(error);
	}
	if (params == null) {
		xhr.send(null);
	} else {
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send(params);
	}
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			window[fonction](xhr.responseText.replace(/\n/g, ''), add);
		}
	};
}

function get_login_return(r) {
	user_ID = r;
}

function get_login() {
	get_page('/mylogin.py', 'get_login_return');
}

function login_return(r, l) {
	if (r == 'Bonjour') {
		user_ID = l;
		try_set_local("login", user_ID);
		f_option();
	} else {
		clean_log(r);
	}
}

function login() {
	var vlogin = $("l_l").value;
	var vpass = $("l_p").value;
	get_page('./login.py?l=' + vlogin + '&p=' + vpass, 'login_return', vlogin);
}

function aff_return(r) {
	clean_log(r);
}

function forget() {
	var mail = $("mail_forget");
	get_page('./forget.py?mail=' + mail.value, 'aff_return');
}

function change_password() {
	var passwd = $("change_passwd");
	get_page('./change_passwd.py?p=' + passwd.value, 'aff_return');
}

function create_account_return(r) {
	if (r == 'ok' ) {
		clean_log("<p>Votre compte vient d'être créé, vous allez recevoir un email de confirmation contenant un lien pour activer votre compte.</p><p>Il est possible que le mail soit considéré comme du spam : pensez à vérifier votre dossier spam.</p>");
	} else {
		clean_log(r);
	}
}

function create_account(){
	var vlogin = $("ca_l");
	var vpass = $("ca_p");
	var vmail = $("ca_mail");
	error = false;
	if (vmail.value.split('@').length != 2) {
		error = 'adresse mail non valide';
	}
	if (vlogin.value.length < 3) {
		error = 'La longueur du login doit faire au moins 3 caractères';
	}
	if (vpass.value.length < 8) {
		error = 'La longueur du mot de passe doit faire au moins 8 caractères';
	}
	if (!error) {
		get_page('/create_account.py?l=' + vlogin.value + '&p=' + vpass.value + '&mail=' + vmail.value, 'create_account_return');
	} else {
		alert(error);
	}
}

function delete_account() {
	if (confirm('Voulez-vous vraiment supprimer votre compte ?') ) {
		f_menu('delete_account');
	}
}

function menu_login() {
	f_menu('menu_login');
	var e = $("log");
	e.style.textAlign = "center";
	return 0;
}

function list_games(p) {
	var detail = p.split(',')[0];
	var id = p.split(',')[1];
	var login = p.split(',')[2];
	if (login == user_ID) {
		login = '';
	}
	if (login != '') {
		login = " (pour "+ login + ")";
	}
	var url = 'stats.py?p=' + detail;
	if (id != '') {
		url += '&i=' + id;
	}
	get_page(url, 'games_return', tr[detail] + login);
}

function get_stats_return(r, id) {
	if (r == 'disconnected') {
		menu_login();
		return 1;
	}
	try {
		j = JSON.parse(r);
	} catch(err) {
		clean_log('impossible de parser le JSON des stats.');
		return 2;
	}
	clean_log('');
	var stats = '';
	if (j.login != user_ID) {
		stats = "<p> Statistiques pour " + j.login + "</p>";
	}
	stats += "<p style='text-align:left;'>Cliquez sur l'élément pour afficher les parties correspondantes</p><hr/>";
	for (var i in tr) {
		if (i == 'total') {
			stats += '<hr/>';
		}
		var params = i + ',' + id + ',' + j.login;
		stats += '<p class="stats" onclick=list_games("' + params + '")>' + tr[i] + ' : ' + j[i] + '</p>';
	}
	var l = $('log');
	l.innerHTML = stats;
	L_stats = stats;
}

function get_stats(id) {
	var url = '/stats.py';
	if (id != '') {
		url += '?i=' + id;
	}
	get_page(url, 'get_stats_return', id);
}

function f_menu_return(r) {
	if (r == 'disconnected') {
		menu_login();
		return 0;
	}
	clean_log(r);
}

function account_return(r) {
	var e = $('account').innerHTML;
	var l = $('log');
	try {
		var j = JSON.parse(r);
		e = 'Bonjour ' + j.login + '<br/><br/>Votre adresse mail est ' + j.mail + e;
		user_ID = j.login;
		try_set_local('user_ID', j.login);
	} catch (err) {
		e = r;
	}
	l.innerHTML = e;
	l.style.textAlign = 'left';
}

function games_return(r, title) {
	if (r == "disconnected") {
		menu_login();
		return;
	}
	var l = $('log');
	var j = JSON.parse(r);
	var e = '';
	if (j.length == 0) {
		e += "<p>Aucune partie disponible.<p/>";
		e += "<p>Si vous devez avoir des parties en cours, déconnectez-vous puis reconnectez-vous.<p/>";
	} else {
		e = '<h3>' + title + '</h3>';
		for (var i in j) {
			var trait = '';
			if (j[i].trait != null && 
				j[i].trait != user_ID && 
				/\)/.test(title) == false) {
					trait = ' (*)';
			}
			e += "<div class='player' onclick='select_game(" + j[i].id + ")' id=" + j[i].id + ">" + j[i].joueurs + trait + "<div class='info'>Commencée le " + j[i].date + "</div></div>";
		}
	}
	if (/parties en cours/.test(title) == true || title == 'total') {
		e += "<div style='font-size: smaller;'><br/><br/>(*) : cette marque indique que c'est à vous de jouer.</div>";
	}
	if (title != 'parties en cours ') {
		e += "<div class='stats' onclick='back_stats()'><p>← Retour</p></div>";
	}
	l.innerHTML = e;
	l.style.textAlign = 'left';
}

function back_stats() {
	var l = $('log');
	l.innerHTML = L_stats;
}

function players_return(r) {
	var l = $('log');
	var j = JSON.parse(r);
	var e = '<p>Cliquez sur le nom du joueur pour lui proposer une partie (cliquez sur le graphique pour voir ses statistiques)</p>';
	if (j.length == 0) {
		e += "<p>Aucun joueur<p/>";
	} else {
		for (var i in j) {
			e += "<div class='lst_players'><img class='lst_players' src='./img/stats.png' onclick='get_stats(" + j[i].id + ")'></div><div class='player lst_players' id=" + j[i].id + " onclick='invite(" + j[i].id + ")'>  " + j[i].nom + "</div><div></div>";
		}
	}
	l.innerHTML = e;
	l.style.textAlign = 'left';
}

function f_menu(m) {
	/*
	Si le menu est dans la page HTML on l'affiche,
	Sinon on affiche la réponse du serveur
	 */
	var e = $(m);
	var l = $('log');
	if (m == 'logout' || m == 'delete_account') {
		user_ID = '';
		game_ID = '';
		try_set_local("login", '');
		try_set_session("gid", '');
	}
	if (m == 'stats') {
		get_stats('');
		return;
	}
	if (m == 'account') {
		get_page(m + '.py', 'account_return');
		return;
	}
	if (m == 'games') {
		get_page(m + '.py', 'games_return', 'parties en cours ');
		return;
	}
	if (m == 'players') {
		get_page(m + '.py', 'players_return');
		return;
	}
	if (e !== null) {
		l.innerHTML = e.innerHTML;
	} else {
		get_page(m + '.py', 'f_menu_return');
	}
	if (m == 'preferences') {
		aff_prefs();
	}
}

function aff_prefs_color_case(variable, defaut, element) {
	var ccb = try_get_local(variable);
	var color = "";
	if (ccb == null || ccb == '' || ccb == 'null') {
		color = defaut;
	} else {
		color = ccb;
	}
	$(element).value = color;
}

function aff_prefs() {
	aff_prefs_color_case("ccb", "#E6E6FA", 'prefs_ccb');
	aff_prefs_color_case("ccn", "#707070", 'prefs_ccn');
	aff_prefs_color_case("size", "0", 'prefs_size');
	var tp = try_get_local("pieces");
	if (tp != '' && tp != null && tp != 'null') {
		$("prefs_pieces").value = tp;	
	}
	var range = $('range');
	range.min = min_size() * -1;
}

function test_prefs() {
	var old = {};
	for (var i in prefs) { // on sauvegarde les valeurs actuelles
		old[prefs[i]] = try_get_local(prefs[i]);
		try_set_local(prefs[i] , $("prefs_" + prefs[i]).value);
	}
	// on applique les valeurs de test
	draw_pieces(position);
	draw_color_case();
	resize();
	for (i in prefs) { // on restaure les valeurs de départ
		if (old[prefs[i]] != null) {
			try_set_local(prefs[i], old[prefs[i]]);
		}
	}
}

function save_prefs() {
	for (var i in prefs) {
		try_set_local(prefs[i] , $("prefs_" + prefs[i]).value);
	}
	draw_pieces(position);
	draw_color_case();
	resize();
	f_menu('preferences');
	add_log('<br/>La configuration est sauvegardée en local.');
	aff_prefs();
}

function invite_return(r) {
	var m = r.split('-')[0];
	if (m == 'ok') {
		alert("La partie est créée, un mail a été envoyé à votre adversaire. C'est à vous de commencer !");
		game_ID = r.split('-')[1];
		player_color = 'white';
		log = '';
		init();
	} else {
		clean_log(r);
	}
}

function invite(id) {
	history.pushState(null, null, "/");
	get_page('/invite.py?id=' + id, 'invite_return');
}

function select_game(id) {
	history.pushState(null, null, "/");
	game_ID = id;
	try_set_session("gid", id);
	clean_log('');
	init();
	var l = $('log');
	l.scrollTop = l.scrollHeight;
}

function send_return(r) {
	if (r == 'ok') {
		var diff = diff_historique();
		var l = $('log');
		if (diff != '') {
			INITIAL_POSITION.nulle = null;
			INITIAL_POSITION.h.push(diff);
			historique.push(diff);
		}
		if (com1 != '') {
			var c = {};
			c.j = user_ID;
			c.n = INITIAL_POSITION.h.length - 1;
			c.t = com1;
			INITIAL_POSITION.c.push(c);
		}
		l.innerHTML = '';
		historique2log(INITIAL_POSITION);
		return 0;
	}
	if (r == "déco") {
		menu_login('menu_login');
		return 0;
	}
	clean_log(r);
}

function check_player_in_game() {
	var p = players.split(' vs ');
	if (user_ID == p[0] || user_ID == p[1]) {
		return true;
	} return false;
}

function send() {
	com1 = $('com').value;
	com = com1;
	com = com.replace(/;/g, "%3B");
	com = com.replace(/\?/g, "%3F");
	com = com.replace(/&/g, "%26");
	com = com.replace(/\+/g, "%2B");
	com = com.replace(/\n/g, "%0A");
	form = $('send_form');
	var flag = form.getElementsByClassName('flag');
	var flag_value = '';
	var r = diff_historique();
	r = r.replace(/\+/g, "%2B");
	r = r.replace(/#/g, "%23");
	var url = '/move.py?c=' + r + '&gid=' + game_ID;
	for (var i = 0; i < flag.length ; i++) {
		if (flag[i].checked) {
			flag_value += flag[i].value;
		}
	}
	if (com.length != 0) {
		url += '&com=' + com;
	}
	
	//~ vérification si la partie est nulle
	var h = INITIAL_POSITION.h;
	var c = new Chess();
	c.reset();
	for (var i = 0; i < h.length; i++) {
		c.move(h[i]);
	}
	c.move(diff_historique());
	if (c.in_draw()) { flag_value='D'; }
	
	if (flag_value.length != 0) {
		url += '&flag=' + flag_value;
		if (flag_value == 'A') {
			if (!confirm('Attention ! Cette action est définitive, voulez-vous vraiment abandonner et perdre cette partie ?')) {
				return;
			}
		}
	}
	/* vérification que tout n'est pas vide */
	if (r == '' && com.length == 0 && flag_value.length == 0) {
		alert("Vous n'avez rien à envoyer.");
		return 2;
	}
	get_page(url, 'send_return');
}

function info(nt) {
	var m = '';
	var t = $('msg_' + nt);
	if (t.innerHTML != '') {
		t.innerHTML = '';
		return;
	}
	for (var i = 0; i < INITIAL_POSITION.c.length; i++) {
		if (INITIAL_POSITION.c[i].n == nt * 2 - 2 || 
			INITIAL_POSITION.c[i].n == nt * 2 - 1) {
			m += '<div class="com_auteur">Commentaire de <b>' + INITIAL_POSITION.c[i].j + '</b> :</div>';
			m += INITIAL_POSITION.c[i].t + '<br><br> ';
		}
	}
	t.innerHTML = m;
}

function on_load() {
	var cdn = try_get_local('cdn');
	if (cdn != null) {
		var e = $('gui').getElementsByTagName('img');
		for (var i = 0; i < e.length; i++) {
			e[i].src = cdn + 'img/' + e[i].src.split('img/')[1];
		}
	}
	init();
}

function UpdateSizeBoardValue(s) {
	var t = $('prefs_size');
	t.value = s;
}

function checkEnter(e) {
	if (e.keyCode == 13) {
		login();
	}
}

function pgn() {
	var t = '<div class="pgn">';
	CHESS.header('White', players.split(' vs ')[0]);
	CHESS.header('Black', players.split(' vs ')[1]);
	CHESS.header('Date', DATE);
	t += '<b>Position :</b><br/><br/>';
	t += CHESS.fen();
	t += '<br/><br/><hr/><b>PGN :</b><br/><br/>';
	t += CHESS.pgn().replace(/\n/g, '<br/>');
	clean_log(t + '</div>');
}

function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '27') { // 'Echap'
		if (MODE_PATRON == true) {
			MODE_PATRON = false;
			console.log('mode ascii OFF');
			draw_board();
			draw_pieces(position);
			return;
		} else {
			MODE_PATRON = true;
			console.log('mode ascii ON');
			draw_board_ascii();
			return;
		}
    }
    
    if ((e.keyCode == '38') || (e.keyCode == '40')) {
		try {
			var num = parseInt(old_one_move.id.split('_')[1]);
		} catch (e) {
			var num = INITIAL_POSITION.h.length; 
		}
		var operation = 0;
		if (e.keyCode == '38') { // up arrow 
			operation = -1;
		}
		if (e.keyCode == '40') { // down arrow
			operation = 1;
		}
		num = num + operation;
		while ( $('coup_' + num) == null ) {
			num = num + operation;
			if (num < 0 || num > INITIAL_POSITION.h.length) {
				break;
			}
		}
		select_one_move(num);
	}
}

function save_prefs_server_return(r) {
	if (r == 'ok') {
		f_menu('preferences');
		add_log('<br/>La configuration est sauvegardée sur le serveur.');
		aff_prefs();
	} else {
		clean_log(r);
	}
}

function save_prefs_server() {
	save_prefs();
	var data = JSON.stringify(localStorage);
	get_page('/save_conf.py?d=' + data, 'save_prefs_server_return');
}

function restore_prefs_server_return(r) {
	if (r != 'error') {
		data = JSON.parse(r);
		for (var i in data) {
			try_set_local(i, data[i]);
		}
		f_menu('preferences');
		add_log('<br/>La configuration est restaurée.');
		aff_prefs();
		draw_pieces(position);
		draw_color_case();
		resize();
	} else {
		clean_log("Une erreur s'est produite lors de la récupération de la configuration.");
	}
}

function restore_prefs_server() {
	get_page('/restore_conf.py', 'restore_prefs_server_return');
}

window.onload = on_load ; 
window.onresize = resize ;
document.onkeydown = checkKey ;
