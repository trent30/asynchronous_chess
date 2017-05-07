player_color = 'white';
players = '';
DATE = '';
position = {};
prefs = ['ccn', 'ccb', 'pieces', 'size', 'date_move', 'date_com', 'couleur_plateau'];
historique = [];
selectColor = "#FF0000";
try_get_local_login();
game_ID = try_get_session('gid');
old_one_move = '';
old_one_move_num = -1;
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
PROMOTION = null;
COUP_PROMOTION = null;
INITIAL_POSITION = {'h' : [], 'c' : []};
MODE_PATRON = false;
com1 = '';
DISPLAY_ALL_MESSAGES = false;
DISPLAY_ALL_COM = false;
VITESSE_MENU_DELAY = 10;
VITESSE_MENU_PAS = 0.05;
ERROR_COUNT = 0;
ERROR_MAX = 10;

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
		if (case_color != '' || case_color != null) {
			var e = document.getElementsByClassName(ec[j]);
			for ( i = 0; i < e.length ; i++) { 
				e[i].style.backgroundColor = case_color;
			}
		}
	}
	var case_color = try_get_local('couleur_plateau');
	var classes = ['rien', 'coord'];
	if (case_color != '' || case_color != null) {
		for (var j = 0 ; j < 2; j++ ) {
			var e = document.getElementsByClassName(classes[j]);
			for ( var i = 0; i < e.length ; i++) {
				e[i].style.backgroundColor = case_color;
			}
		}
		$('board').style.backgroundColor = case_color;
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
	var file_type = ".png";
	if (get_type_pieces().substr(-3) == 'svg') {
		file_type = ".svg";
	}
	for(var i in p) {
		var id = i + '';
		var e = $(id);
		if (e != null) {
			if (p[id] == '') {
				e.innerHTML = '';
			} else {
				e.innerHTML = '<img class="pieces" src="' + get_cdn() + './pieces/' + get_type_pieces() + '/' + p[id] + file_type + '"</>';
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
	draw_board();
	init_position();
	if (param == '?fen') {
		var arg = location.search.split('=')[1].replace(/%20/g, ' ');
		console.log(arg);
		CHESS = new Chess(arg);
		position = CHESS.position();
		game_ID = '0';
	}
	if (game_ID != '' && game_ID != '0') {
		get_page('/game_info.py?g=' + game_ID, 'init_return');
	}
	draw_pieces(position);
	historique = [];
	log = '';
	if (game_ID == '') {
		f_option();
	}
	if (game_ID == '0') {
		clean_log('<p><b>Position :</b></p>' + arg);
	}
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
	if (n < 0) {
		init_position();
		old_one_move_num = -1;
	} else {
		if ( n > historique.length) {
			old_one_move_num = historique.length;
			n = old_one_move_num;
		}
		dselect_one_move(old_one_move);
		var e = $( 'coup_' + n );
		e.style.background = '#D4D4D4';
		old_one_move = e;
		old_one_move_num = n;
		init_position();
		for (var i = 0; i <= n; i++) {
			CHESS.move(historique[i]);
		}
	}
	deselect();
	position = CHESS.position();
	draw_pieces(position);
	set_game_info(true);
}

function list_check_com(h, l) {
	var r = [];
	for (var i = 0; i < h.h.length; i++) {
		r[i] = false;
	}
	if (l == null) {
		return r;
	}
	for (var i = 0; i < l.length; i++) {
		r[ l[i].n ] = true;
	}
	return r;
}

function message_or_not(b, b2) {
	if (!b && !b2) {
		return '<div class="order hide">.</div>';
	}
	var txt = '<div class="order">';
	if (b) {
		txt += '<img src="./img/msg16x16.png" onclick="info(_n_)"  title="message">';
	}
	if (b2) {
		txt += '<img style="margin-left : 3px" src="./img/msg_priv.png" onclick="note(_n_)"  title="commentaire">';
	}
	return txt += '</div>';
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

function check_trait() {
	var p = players.split(' vs ');
	if (user_ID != p[0] && user_ID != p[1]) {
		return false;
	}
	if (CHESS.history().length != INITIAL_POSITION.h.length) {
		return false;
	}
	if (player_color == 'black' && (historique.length % 2) == 1) {
		return true;
	}
	if (player_color == 'white' && (historique.length % 2) == 0) {
		return true;
	}
	return false;
}

function balise(b, t) {
	return ('<$0>' + t + '</$0>').replace(/\$0/g, b);
}

function historique2log(h) {
	var t = '<div id="print_all" style="text-align: right;">';
	if (h.c != null) {
		if (h.c.length > 0) {
			t += '<img src="./img/msg16x16.png" title="afficher/masquer tous les messages" onclick="print_all_messages()">';
		}
	}
	if (h.n != null) {
		if (h.n.length > 0) {
			t += '<img style="margin-left:3px;"src="./img/msg_priv.png" title="afficher/masquer tous les commentaires" onclick="print_all_com()">';
		}
	}
	t += '</div><div class="msg" id="msg_0"></div>';
	clean_log(t);
	t = '';
	var numero = 0;
	var l = list_check_com(h, h.c);
	var ln = list_check_com(h, h.n);
	var m = '';
	var i = 0;
	var com = false;
	var note = false;
	var llog = '';
	var div_msg = '<div class="msg" id="msg_';
	var div_note = '<div class="msg" id="note_';
	var classes = '';
	try {
		var dates = h.date;
	} catch (e) {
		var dates = null;
	}
	if (string_to_bool(try_get_local("date_move")) == false) {
		var dates = null;
	}
	for (i = 0; i < h.h.length; i++) {
		if (dates != null) {
			var date = dates[i];
			if (date == null) {
				date = '';
			}
		} else {
			var date = '';
		}
		if (i + 1 > INITIAL_POSITION.h.length) {
			classes = "order grey";
		} else {
			classes = "order";
		}
		t = "<div class='" + classes + "' onclick=select_one_move(" + i + ") id=coup_" + i + ">" + piece_to_image(h.h[i]) + balise('span', date) + "</div>" + t;
		
		if (l == null) {
			com = false;
		} else {
			if (l[i + 1] == true) {
				if ( i != 0) {
					com = true;
				}
			}
		}
		if (ln == null) {
			note = false;
		} else {
			if (ln[i] == true) {
				note = true;
			}
		}
		if ( i % 2 == 0 ) {
			numero = i / 2 + 1;
		} else {
			m = message_or_not(com, note);
			llog += m.replace(/_n_/g, numero) + t + '<div id="num_' + numero + '" class="num order" onclick=f_add_com(' + numero + ');>' + numero + balise('span', "Ajouter un commentaire") + '</div>';
			llog += div_msg + numero + '"></div><div class="plate hide">.</div>';
			llog += div_note + numero + '"></div><div class="plate hide">.</div>';
			t = '';
			com = false;
			note = false;
		}
	}
	if ( i % 2 == 1 ) {
		m = message_or_not(l[i], ln[i - 1]);
		llog += m.replace(/_n_/g, numero) + "<div class='order'>...</div>" + t + '<div class="num order" onclick=f_add_com(' + numero + ');>' + numero + balise('span', "Ajouter un commentaire") + '</div>';
		llog += div_msg + numero + '"></div>';
		llog += div_note + numero + '"></div>';
	}
	add_log(llog);
	if ( h.nulle != null) {
		add_log('<div id="nulle_message"><div class="msg">Votre adversaire vous propose la nulle.</div><div onclick="finish()" class="btn">Accepter</div><div onclick="remove_nulle_message();" class="btn">Refuser</div></div>');
	}
	if ( h.r != null) {
		add_log("<b>" + h.r + "</b>");
	}
	if ( h.r == null && CHESS.in_draw() ) {
		add_log("<b>½-½</b>");
	}
	if ( h.r == null && !CHESS.in_draw() && check_trait() ) {
		add_log("<br/>C'est à vous de jouer");
		YOUR_TURN = true;
	} else {
		YOUR_TURN = false;
	}
}

function f_add_com(n) {
	if ($("add_com" + n) == null) {
		$("msg_" + n).innerHTML += '</div><div id="add_com' + n + '">' + $("add_com").innerHTML.replace(/param/g, "'add_com" + n + "'") + "</div>";
	}
}

function f_send_note_return(r, t) {
	if (r == 'ok') {
		if (INITIAL_POSITION.n == null) {
			INITIAL_POSITION.n = [];
		}
		INITIAL_POSITION.n.push(t);
		f_init();
		return;
	}
	if (r == "déco") {
		menu_login('menu_login');
		return;
	}
	clean_log(r);
}

function f_send_bug_return(r) {
	clean_log('');
	if (r == 'ok') {
		add_log('<div style="text-align : center;">Votre rapport a bien été enregistré.<div><a onclick="f_list_bugs(&quot;?fixed=2&quot;);" href="#">Voir la liste</a></div></div>');
		return;
	}
	clean_log(r);
}

function f_send_bug(rep) {
	var t = clean_text($('bug_text_' + rep).value);
	var url = './add_com.py?bug=1&status=2';
	url += '&rep=' + rep;
	url += '&com=' + t;
	get_page(url, 'f_send_bug_return');
}

function reponse_html(id) {
	return 'Réponse : <textarea class="com" name="bug_text" id="bug_text_$"></textarea><div onclick="f_send_bug($);" class="btn_com inline">Envoyer</div><br/><br/>'.replace(/\$/g, id);
}

function f_repondre_bug_return(r, data) {
	$('log').innerHTML = data[0];
	var j = JSON.parse(r);
	var t = '';
	for (var i in j) {
		t += list_bugs_to_html(j[i], true);
	}
	t += reponse_html(data[1]);
	$('bug_' + data[1]).innerHTML = t;
}

function f_repondre_bug(nb, id) {
	if (parseInt(nb) != 0) {
		get_page('./get_bugs.py?rep=' + id, 'f_repondre_bug_return', [$('log').innerHTML, id]);
	} else {
		$("bug_" + id).innerHTML = reponse_html(id);
	}
}

function list_bugs_to_html(dico, rep) {
	var t = '<div class="com_auteur">Rapport de <b>' + dico['login'] + '</b> :<div class="com_date">' + dico['date'] + '</div></div>';
	if (rep) {
		t = t.replace(/Rapport/, 'Réponse');
	}
	t += '<div class="msg">' + dico['text'] + '</div><br/><hr/>';
	t += '<div id="bug_$1">'.replace(/\$1/, dico['id']);
	if (!rep) {
		t += '<div style="float : left;" class="ta_left inline">Nombre de réponse(s) : ' + dico['nrep'] + '</div>';
		t += '<div class="inline btn_com" style="float: right;" onclick="f_repondre_bug($0,$1)">voir la discussion / répondre</div><br/><br/><hr/><br/><br/>'.replace(/\$0/, dico['nrep']).replace(/\$1/, dico['id']);
	}
	t += '</div>';
	return t;
}

function f_list_bugs_return(r, p) {
	var t = '<h3 class="ta_left pointer" onclick=f_list_bugs("?fixed=2")>Liste des bugs en cours</h3>';
	t += '<div class="ta_left pointer" onclick=f_list_bugs("?fixed=3")><p>Cliquez ici pour afficher les bugs résolus<p></div>';
	if ( p == '?fixed=3') {
		t = '<h3 class="ta_left pointer" onclick=f_list_bugs("?fixed=3")>Liste des bugs résolus</h3>';
		t += '<div class="ta_left pointer" onclick=f_list_bugs("?fixed=2")><p>Cliquez ici pour afficher les bugs en cours<p></div>';
	}
	var j = JSON.parse(r);
	for (var i in j) {
		t += list_bugs_to_html(j[i], false);
	}
	clean_log(t);
	if (j.length == 0) {
		add_log('La liste est vide');
	}
	$('log').scrollTop = 0;
}

function f_list_bugs(param) {
	get_page('./get_bugs.py' + param, 'f_list_bugs_return', param);
}

function f_send_note(param) {
	var t = clean_text($(param).getElementsByTagName('textarea')[0].value);
	if (t.length == 0) {
		alert("Vous n'avez saisie aucun texte.");
		return;
	}
	var url = '/add_com.py?g=' + game_ID;
	url += '&com=' + t;
	var dico = {};
	dico.j = user_ID;
	dico.d = '';
	dico.t = t;
	dico.n = parseInt(param.replace(/add_com/g, '')) * 2 - 2;
	url += '&n=' + dico.n;
	get_page(url, 'f_send_note_return', dico);
}

function f_cancel_note(e) {
	var i = $(e);
	i.parentNode.removeChild(i);
}

function remove_nulle_message_return(r) {
	if ( r == 'ok') {
		INITIAL_POSITION.nulle = null;
		f_init();
	} else {
		clean_log(r);
	}
}

function remove_nulle_message() {
	var i = $('nulle_message');
	i.parentNode.removeChild(i);
	get_page('/finish.py?g=' + game_ID + '&token=' + INITIAL_POSITION.nulle + '&abort=True', 'remove_nulle_message_return'); 
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
	draw_color_case();
}

function anim_stop() {
	try {
		clearInterval(INTERVAL_ID);
	} catch (err) {}
	var img = $('send_btn_img').style;
	img.backgroundColor = "white";
}

function anim_send_btn() {
	var img = $('send_btn_img').style;
	if (img.backgroundColor == "white") {
		img.backgroundColor = "orange";
	} else {
		img.backgroundColor = "white";
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
	if ((selection.coord == '' && selection.piece == '') || 
		(getPieceFromHtml(e.innerHTML)[1] == selection.piece[1]) ) {
		if (e2 != null) {
			e2.style.background = selection.color;
		}
		selection.coord = c;
		selection.color = e.style.background;
		selection.html = e.innerHTML;
		selection.piece = getPieceFromHtml(e.innerHTML);
		e.style.background = selectColor;
	} else {
		//~ "retour manuel"
		var last = CHESS.history({ verbose: true }).pop();
		if (last != null) {
			if (c == last.from && selection.coord == last.to) {
				CHESS.undo();
				select_one_move(CHESS.history().length - 1);
				deselect();
				return;
			}
		}
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
				((c[1] == 1) && (selection.piece == 'pn'))) ) { // promotion
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
		if (YOUR_TURN) {
			anim_start();
		}
		if (coup.c1 !== '') {
			position[coup.c1] = '';
		}
		position[c] = selection.piece;
		historique = CHESS.history();
		historique2log({'h' : CHESS.history(), 'c' : INITIAL_POSITION.c, 'n' : INITIAL_POSITION.n});
		try {
			e2.style.background = selection.color;
			e2.innerHTML = '';
		} catch (error) {
		}
		e.innerHTML = selection.html;
		deselect();
		draw_color_case();
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
			if (YOUR_TURN) {
				anim_start();
			}
			if (COUP_PROMOTION.c1 !== '') {
				position[COUP_PROMOTION.c1] = '';
			}
			position[COUP_PROMOTION.c2] = p;
			historique.push(CHESS.history().pop());
			historique2log({'h' : CHESS.history(), 'c' : INITIAL_POSITION.c, 'n' : INITIAL_POSITION.n});
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
	var p = '';
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
	var piece = ['T', 'C', 'F', 'D'];
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
		'à propos' : 'about',
		'news' : 'news' };
	if (connected == false) {
		m = {'se connecter' : 'menu_login',
		'à propos' : 'about'};
	}
	return m;
}

function try_get_local_login() {
	user_ID = try_get_local("login");
}

function checknews() {
	var l_news = try_get_local("news");
	if (l_news == null) {
		l_news = 0;
	}
	try {
		var nb_news = MY_NEWS;
	} catch (e) {
		nb_news = 0;
	}
	if (l_news > nb_news) {
		nb_news = l_news;
	}
	try {
		if (nb_news < BREAKING_NEWS) {
			return true;
		}
	} catch (e) {}
	return false;
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
		var elo = try_get_local('elo');
		if (elo == null) {
			elo = '';
		}
		if (elo != '') {
			elo = ' (' + elo + ')';
		}
		t = '<div id="login">Vous êtes connecté en tant que : ' + user_ID + elo +'</div>';
		m = build_menu(true);
	}
	t += '<div id="menu"> ';
	for (var i in m) {
		var id = 'menu_btn_' + m[i];
		var txt = i;
		if (i == 'news') {
			if (checknews()) {
				txt += ' (*)';
			}
		}
		t += '<div id="' + id + '" class="btn" onclick=f_menu("' + m[i] + '")>' +  txt + '</div>';
	}
	e.innerHTML = t + '</div>';
	var cpt = 0.0;
	for (var i in m) {
		var id = 'menu_btn_' + m[i];
		$(id).style.opacity = 0;
		cpt += 1;
		anim_menu(id, - 0.1 * cpt);
	}
}

function anim_menu(p, depart) {
	var btn = $(p);
	var o = parseFloat(btn.style.opacity);
	if ( o < 1 ) {
		depart += VITESSE_MENU_PAS;
		if (depart > 0) {
			btn.style.opacity = depart;
		}
		setTimeout( anim_menu, VITESSE_MENU_DELAY, p, depart );
	}
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
	DISPLAY_ALL_MESSAGES = false;
	DISPLAY_ALL_COM = false;
}

function nothing_return(x) {
	console.log(x);
	return;
}

function bug_report_return(x) {
	if (x == 'reload') {
		console.log("coup en double détecté, rechargement de l'historique");
		f_reload();
	}
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
	e.innerHTML = '<div class="game_info" onclick=pgn()>partie #' + game_ID + ' : ' + p[0] + ' (' + s.b + ') - ' + p[1] +  ' (' + s.n + ')</div><div id="game_prefs" class="pointer" onclick=game_prefs()><img title="paramètres" src="./img/chronometer.png"></div><a href="./rss_game.py?game=' + game_ID + '" target="_blank"><img title="Flux RSS" style="margin-left : 10px;" src="./img/rss.png"/></a>' ;
}

function game_prefs_return(r) {
	try {
		var j = JSON.parse(r);
	} catch (err) {
		clean_log('Vous devez jouer dans cette partie pour modifier ce paramètre.');
		return;
	}
	var r = $('rappel_html');
	clean_log(r.innerHTML);
	$("rappel_interval").value = j.rappel;
}

function game_prefs() {
	get_page('/game_prefs.py?g=' + game_ID, 'game_prefs_return');
}

function save_rappel() {
	var param = '&set=';
	param += $('rappel_interval').value;
	get_page('/game_prefs.py?g=' + game_ID + param, 'game_prefs_return');
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
		clean_log('La récupération de la liste des coups a échoué');
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
	DISPLAY_ALL_MESSAGES = false;
	DISPLAY_ALL_COM = false;
	var param = '&c=1';
	if (string_to_bool(try_get_local("date_move"))) {
		param += '&date=1';
	}
	if (string_to_bool(try_get_local("date_com"))) {
		param += '&date_com=1';
	}
	get_page('/history.py?g=' + game_ID + param, 'f_reload_return');
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
	$('com').value = com1;
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
			get_page('/bug.py?g=' + game_ID + '&c=' + i + '%3D' + coup, 'bug_report_return');
		} else {
			historique.push(h.h[i]);
		}
	}
	position = CHESS.position();
	draw_pieces(position);
	historique2log(h);
}

function get_page(name, fonction, add) {
	clean_log('<div class="center"><img src="./img/wait.gif"></div>');
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
		try {
			xhr.send(null);
		}
		catch (e) {}
	} else {
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		try {
			xhr.send(params);
		}
		catch (e) {}
	}
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			window[fonction](xhr.responseText.replace(/\n/g, ''), add);
		}	
		if (xhr.readyState == 4 && xhr.status != 200) {
			console.log("Erreur " + xhr.status + " pour la page : " + name);
		}	
		if (xhr.readyState == 4 && xhr.status == 404) {
			clean_log('Erreur 404 : la page « ' + url + " » n'a pas pu être chargée.");
		}
		if (xhr.readyState == 4 && xhr.status == 0) {
			console.log("Le serveur semble être injoignable pour la page : " + name);
		}
		var et = xhr.status.toString()[0];
		if (xhr.readyState == 4 && ERROR_COUNT < ERROR_MAX) {
			if (et == '4' || et == '5') {
				ERROR_COUNT++;
				get_page('./add_com.py?bug=1&com=' + xhr.status, 'error_return', xhr.status);
			}
		}
	};
}

function error_return(r, add) {
	clean_log('Erreur ' + add);
}

function get_login_return(r) {
	user_ID = r;
}

function get_login() {
	get_page('/mylogin.py', 'get_login_return');
}

function login_return(r, l) {
	try {
		var j = JSON.parse(r);
		try_set_local("news", j['MY_NEWS']);
		BREAKING_NEWS = j['BREAKING_NEWS'];
		user_ID = l;
		try_set_local("login", user_ID);
		f_option();
	} catch(e) {
		clean_log(r);
	}
}

function login() {
	var vlogin = $("l_l").value;
	var vpass = clean_text($("l_p").value);
	get_page('./login.py?l=' + clean_text(vlogin) + '&p=' + vpass, 'login_return', vlogin);
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
	var vlogin = clean_text($("ca_l").value);
	var vpass = clean_text($("ca_p").value);
	var vmail = clean_text($("ca_mail").value);
	error = false;
	if (vmail.split('@').length != 2) {
		error = 'adresse mail non valide';
	}
	if (vlogin.length < 3) {
		error = 'La longueur du login doit faire au moins 3 caractères';
	}
	if (vpass.length < 8) {
		error = 'La longueur du mot de passe doit faire au moins 8 caractères';
	}
	if (!error) {
		get_page('/create_account.py?l=' + vlogin + '&p=' + vpass + '&mail=' + vmail, 'create_account_return');
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
		login = login.replace('∞', ' ');
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
	stats += "<p style='text-align:left;'>Cliquez sur l'élément pour afficher les parties correspondantes</p>";
	stats += '<li class="stats_li" onclick=get_page("stats.py?p=all","games_return","")>toutes les parties de tous les joueurs</li>';
	stats += '<li class="stats_li" onclick=get_page("stats.py?p=all_not_finish","games_return","")>toutes les parties en cours</li>';
	stats += '<li class="stats_li" onclick=get_page("stats.py?p=all_finish","games_return","")>toutes les parties finies</li><hr/>';
	for (var i in tr) {
		if (i == 'total') {
			stats += '<hr/>';
		}
		var params = i + ',' + id + ',' + j.login.replace(' ', '∞');
		stats += '<p class="stats" onclick=list_games("' + params + '")>' + tr[i] + ' : ' + j[i] + '</p>';
	}
	stats += "<div class='stats' onclick=f_menu('players')><p>← Retour à la liste des joueurs</p></div>";
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

function save_free_account_return(r) {
	if (r == 'ok') {
		clean_log($('save_free_account_return').innerHTML);
		return 0;
	}
	clean_log(r);
}

function save_free_account() {
	var url = '/save_free_account.py?user=';
	var free_user = $('free_user').value;
	if (free_user == "") {
		alert('Veuillez saisir un identifiant.');
		return;
	}
	if (free_user.search(/^[a-zA-Z0-9]*$/) == -1) {
		alert('Identifiant invalide.');
		return;
	}
	var free_passwd = $('free_passwd').value;
	if (free_passwd == "") {
		alert('Veuillez saisir un code.');
		return;
	}
	if (free_passwd.search(/^[a-zA-Z0-9]*$/) == -1) {
		alert('Code invalide.');
		return;
	}
	url += free_user;
	url += '&pass=';
	url += free_passwd;
	url += '&active=';
	url += $('free_alert').checked;
	get_page(url, 'save_free_account_return');
}

function account_return(r) {
	var e = $('account').innerHTML;
	var l = $('log');
	try {
		var j = JSON.parse(r);
	} catch (err) {
		e = r;
		l.innerHTML = e;
		l.style.textAlign = 'left';
		return ;
	}
	e = e.replace(/\$login/, j.login).replace(/\$mail/, j.mail).replace(/\$ELO/,j.elo);
	user_ID = j.login;
	try_set_local('user_ID', j.login);
	try_set_local('elo', j.elo);
	l.innerHTML = e;
	l.style.textAlign = 'left';
	if (j.free_alert == "t") {
		$('free_alert').checked = true;
	}
	$('free_user').value = j.free_user;
	$('free_passwd').value = j.free_pass;
}

function games_return(r, title) {
	if (r == "disconnected") {
		menu_login();
		return;
	}
	var l = $('log');
	var j = JSON.parse(r);
	LIST_STAT = j;
	var e = '';
	if (j.length == 0) {
		e += "<p>Aucune partie disponible.<p/>";
	} else {
		e = '<h3>' + title + '</h3>';
		if (title == 'parties en cours ') {
			e = "<div onclick=f_menu('games');><h3>" + title + "</h3></div>";
		}
		e += "<div id='game_info' class='pointer' onclick=get_all_pgn(LIST_STAT);>Récupérer en PGN</div>";
		for (var i in j) {
			var trait = '';
			if (j[i].trait != null && 
				j[i].trait != user_ID && 
				/\)/.test(title) == false) {
					trait = ' (*)';
			}
			e += "<div class='player' onclick='select_game(" + j[i].id + ")' id=" + j[i].id + "><a href='./?gid=" + j[i].id + "'>" + j[i].joueurs + trait + "<div class='info'>Commencée le " + j[i].date + "</a></div></div>";
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

function get_all_pgn_return(r, param) {
	ALL_HISTORY[param.id] = {};
	ALL_HISTORY[param.id].date = param.date;
	ALL_HISTORY[param.id].joueurs = param.joueurs;
	ALL_HISTORY[param.id].h = JSON.parse(r);
	var l = Object.keys(ALL_HISTORY).length;
	var pct = parseInt(l * 100 / param.max);
	var pb = '<progress id="pb" value="$0" max="$1">$2%</progress>'.replace(/\$0/, l).replace(/\$1/, param.max).replace(/\$2/, pct);
	clean_log('génération du PGN ' + param.id + ' en cours...(' + pct + '%)<br/>' + pb);
	$('log').style.textAlign = 'center';
	if ( l < param.max) { 
		//~ Si tout n'est pas encore récupéré
		return ;
	}
	var pgn = '<div class="pgn">';
	for (var i in ALL_HISTORY) {
		var pgn_chess = new Chess();
		for (var j = 0; j < ALL_HISTORY[i].h.h.length; j++) {
			pgn_chess.move(ALL_HISTORY[i].h.h[j]);
		}
		var players = ALL_HISTORY[i].joueurs;
		pgn_chess.header('Site', location.host);
		pgn_chess.header('Event', 'game #' + i);
		pgn_chess.header('White', players.split(' vs ')[0]);
		pgn_chess.header('Black', players.split(' vs ')[1]);
		pgn_chess.header('Date', ALL_HISTORY[i].date.replace(/-/g, '.').split(' ')[0]);
		if (ALL_HISTORY[i].h.r != null) {
			pgn_chess.header('Result', ALL_HISTORY[i].h.r);
		}
		pgn += pgn_chess.pgn({}, ALL_HISTORY[i].h.date).replace(/\n/g, '<br/>');
		pgn += '<br/><br/><hr/><br/>';
	}
	clean_log( pgn + '</div>' );
}

function get_all_pgn(liste) {
	ALL_HISTORY = {};
	var max = liste.length;
	var param = '';
	if ( string_to_bool(try_get_local('date_move') ) ) {
		param = '&date=1';
	}
	for (var i = 0; i < max; i++) {
		liste[i].max = max;
		get_page('./history.py?g=' + liste[i].id + param, 'get_all_pgn_return', liste[i]);
	}
}
	
function back_stats() {
	var l = $('log');
	l.innerHTML = L_stats;
}

function sort_players(key, asc) {
	add_log('tri en cours...');
	ALL_PLAYERS.sort(function (i, j) {
		var a = i[key].toString().toLowerCase();
		var b = j[key].toString().toLowerCase();
		if (a == b) {
			return 0;
		}
		if (a < b) {
			if (asc) {
				return -1;
			} else {
				return 1;
			}
		} else if (a > b) {
			if (asc) {
				return 1;
			} else {
				return -1;
			}
		}
		});
	all_players_to_html(ALL_PLAYERS);
}

function all_players_to_html(j) {
	e = $('btn_tri').innerHTML;
	for (var i in j) {
		var game_with = '';
		if (j[i].game == 1) {
			game_with = ' (*)';
		}
		var p = "onclick=invite(" + j[i].id + ",'" + j[i].nom.replace(' ', '∞') + "');";
		e += "<div class='lst_players'><img class='lst_players' src='./img/stats.png' onclick='get_stats(" + j[i].id + ")'></div><div class='player lst_players' id=" + j[i].id + " " + p + ">  " + j[i].nom + " ( " + j[i].elo + " ELO, $1 )$0</div><div></div>";
		e = e.replace(/\$0/, game_with);
		e = e.replace(/\$1/, j[i].stats);
	}
	e = e.replace('ELO,  )', 'ELO )');
	clean_log(e);
	$('log').style.textAlign = 'left';
}

function players_return(r) {
	var j = JSON.parse(r);
	ALL_PLAYERS = j;
	//~ on en profite pour mettre à jour le elo du joueur
	for (var i in j) {
		if (j[i].nom == user_ID) {
			try_set_local('elo', j[i].elo);
		}	
	}
	all_players_to_html(j);
}

function news_return(r) {
	clean_log('<div class="ta_left"><h3>Liste des derniers commits<h3></div>');
	add_log(r);
	$('log').scrollTop = 0;
	try_set_local('news', BREAKING_NEWS);
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
	if (m == 'news') {
		get_page('news.py?html=1', 'news_return');
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
	aff_prefs_color_case("couleur_plateau", "#000000", 'prefs_couleur_plateau');
	aff_prefs_color_case("size", "0", 'prefs_size');
	var tp = try_get_local("pieces");
	if (tp != '' && tp != null && tp != 'null') {
		$("prefs_pieces").value = tp;	
	}
	var range = $('range');
	range.min = min_size() * -1;
	$("prefs_date_move").checked = string_to_bool(try_get_local("date_move"));
	$("prefs_date_com").checked = string_to_bool(try_get_local("date_com"));
}

function string_to_bool (t) {
	if (t == 'false') {
		return false;
	}
	return true;
}

function test_prefs() {
	save_prefs_in_localStorage(prefs);
	draw_pieces(position);
	draw_color_case();
	resize();
}

function save_prefs_in_localStorage(d) {
	for (var i in d) {
		var elt = $("prefs_" + d[i]);
		if (elt.type == 'checkbox') {
			var valeur = elt.checked;
		} else {
			var valeur = elt.value;
		}
		try_set_local(d[i] , valeur);
	}
}

function test_theme() {
	var v = $("prefs_theme").value;
	if (v == 'gris') {
		$("prefs_ccn").value = '#858585';
		$("prefs_ccb").value = '#E6E6FA';
		$("prefs_couleur_plateau").value = '#000000';
	}
	if (v == 'bleu') {
		$("prefs_ccn").value = '#7389b6';
		$("prefs_ccb").value = '#f3f3f3';
		$("prefs_couleur_plateau").value = '#1B253B';
	}
	if (v == 'rouge') {
		$("prefs_ccn").value = '#BE6D6D';
		$("prefs_ccb").value = '#F8F8F8';
		$("prefs_couleur_plateau").value = '#000000';
	}
	if (v == 'vert') {
		$("prefs_ccn").value = '#3C9742';
		$("prefs_ccb").value = '#E8E8FC';
		$("prefs_couleur_plateau").value = '#000000';
	}
	if (v == 'nuit') {
		$("prefs_ccn").value = '#494B4B';
		$("prefs_ccb").value = '#E1E1E1';
		$("prefs_couleur_plateau").value = '#000000';
	}
	if (v == 'lsd') {
		$("prefs_ccn").value = '#945197';
		$("prefs_ccb").value = '#A2EF56';
		$("prefs_couleur_plateau").value = '#000000';
	}
	test_prefs();
}

function invite_return(r) {
	var m = r.split('-')[0];
	if (m == 'ok') {
		alert("La partie est créée, un mail a été envoyé à votre adversaire.");
		game_ID = r.split('-')[1];
		player_color = 'white';
		log = '';
		init();
	} else {
		clean_log(r);
	}
}

function f_invite(id) {
	if ($('choix_couleur').value == 'noir') {
		id += '&couleur=noir';
	}
	if ($('choix_couleur').value == 'au hasard') {
		id += '&couleur=pif';
	}
	if ($('choix_couleur').value == "l'inverse de la partie précédente") {
		id += '&couleur=revanche';
	}
	get_page('/invite.py?id=' + id, 'invite_return');
}

function invite(id, joueur) {
	joueur = joueur.replace('∞', ' ');
	if ( joueur == user_ID) {
		alert('Vous ne pouvez pas créer une partie contre vous-même.');
		return;
	}
	var t = $('invite').innerHTML;
	t = t.replace(/\$0/g, joueur);
	t = t.replace(/\$1/g, id );
	history.pushState(null, null, "/");
	clean_log(t);
	var l = $('log');
	l.style.textAlign = "center";
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

function send_return(r, flag) {
	if (r == 'ok') {
		var diff = diff_historique();
		var l = $('log');
		if (diff != '') {
			INITIAL_POSITION.nulle = null;
			INITIAL_POSITION.h.push(diff);
		}
		if (com1 != '') {
			var c = {};
			c.j = user_ID;
			c.n = INITIAL_POSITION.h.length;
			c.t = com1;
			INITIAL_POSITION.c.push(c);
		}
		if (flag == 'A') {
			INITIAL_POSITION.r = 'Vous avez abandonné';
		}
		l.innerHTML = '';
		historique2log(INITIAL_POSITION);
		com1 = '';
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

function clean_text(t) {
	t = t.replace(/;/g, "%3B");
	t = t.replace(/\?/g, "%3F");
	t = t.replace(/&/g, "%26");
	t = t.replace(/\+/g, "%2B");
	t = t.replace(/\n/g, "%0A");
	return t;
}

function send() {
	com1 = $('com').value;
	com = com1;
	com = clean_text(com);
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
		if (flag_value == 'N') {
			if (!confirm('Attention ! Voulez-vous vraiment proposer la nulle à votre adversaire ?')) {
				return;
			}
		}
	}
	/* vérification que tout n'est pas vide */
	if (r == '' && com.length == 0 && flag_value.length == 0) {
		alert("Vous n'avez rien à envoyer.");
		return 2;
	}
	get_page(url, 'send_return', flag_value);
}

function print_all_com() {
	var longueur = INITIAL_POSITION.h.length;
	for (var i = 0; i <= longueur; i++) {
		var t = $('note_' + i);
		if (t != null) {
			t.innerHTML = '';
		}
	}
	if (DISPLAY_ALL_COM) {
		DISPLAY_ALL_COM = false;
	} else {
		DISPLAY_ALL_COM = true;
		for (var i = 0; i <= longueur; i++) {
			note(i);
		}
	}
}

function print_all_messages() {
	var longueur = INITIAL_POSITION.h.length;
	for (var i = 0; i <= longueur; i++) {
		var t = $('msg_' + i);
		if (t != null) {
			t.innerHTML = '';
		}
	}
	if (DISPLAY_ALL_MESSAGES) {
		DISPLAY_ALL_MESSAGES = false;
	} else {
		DISPLAY_ALL_MESSAGES = true;
		for (var i = 0; i <= longueur; i++) {
			info(i);
		}
	}
}

function note(nt) {
	var m = '';
	var t = $('note_' + nt);
	if (t == null) { return; }
	if (t.innerHTML != '') {
		t.innerHTML = '';
		return;
	}
	for (var i = 0; i < INITIAL_POSITION.n.length; i++) {
		if (INITIAL_POSITION.n[i].n == nt * 2 - 2 || 
			INITIAL_POSITION.n[i].n == nt * 2 - 1) {
			var date = '';
			if (INITIAL_POSITION.n[i].d != null) {
				date = INITIAL_POSITION.n[i].d;
			}
			m += '<div class="com_auteur">Commentaire de <b>' + INITIAL_POSITION.n[i].j + '</b> :<div class="com_date">' + date + '</div></div>';
			m += INITIAL_POSITION.n[i].t + '<br><br> ';
		}
	}
	t.innerHTML = m;
}

function info(nt) {
	var m = '';
	var t = $('msg_' + nt);
	if (t == null) { return; }
	if (t.innerHTML != '') {
		t.innerHTML = '';
		return;
	}
	for (var i = 0; i < INITIAL_POSITION.c.length; i++) {
		if (parseInt((INITIAL_POSITION.c[i].n + 1) / 2) == nt ) {
			var date = '';
			if (INITIAL_POSITION.c[i].d != null) {
				date = INITIAL_POSITION.c[i].d;
			}
			m += '<div class="com_auteur">Message de <b>' + INITIAL_POSITION.c[i].j + '</b> :<div class="com_date">' + date + '</div></div>';
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

function UpdateTextSizeBoardValue(s) {
	var t = $('prefs_size');
	t.value = s;
}

function UpdateSizeBoardValue(s) {
	UpdateTextSizeBoardValue(s);
	test_prefs();
}

function checkEnter(e) {
	if (e.keyCode == 13) {
		login();
	}
}

function pgn(date) {
	var t = '<div class="pgn">';
	CHESS.header('Site', location.host);
	CHESS.header('Event', 'game #' + game_ID);
	CHESS.header('White', players.split(' vs ')[0]);
	CHESS.header('Black', players.split(' vs ')[1]);
	CHESS.header('Date', DATE.replace(/-/g, '.'));
	t += '<b>Position :</b><br/><br/>';
	t += '<a href="' + './?fen=' + CHESS.fen() + '" target="_blank">' + CHESS.fen() + '</a>';
	t += '<br/><br/><hr/><b>PGN :</b>'
	if (date == false) {
		if (INITIAL_POSITION.date != null) {
			t += '<div onclick=pgn() class="pointer">(afficher les dates)</div><br/>';
		} else {
			t += '<br/><br/>';
		}
		t += CHESS.pgn({}, null).replace(/\n/g, '<br/>');
	} else {
		if (INITIAL_POSITION.date != null) {
			t += '<div onclick=pgn(false) class="pointer">(supprimer les dates)</div><br/>';
		} else {
			t += '<br/><br/>';
		}
		t += CHESS.pgn({}, INITIAL_POSITION.date).replace(/\n/g, '<br/>');
	}
	t += "<div class='stats' onclick='f_init()'><p>← Revenir à la liste des coups</p></div>";
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
		} else {
			MODE_PATRON = true;
			console.log('mode ascii ON');
			draw_board_ascii();
		}
		return;
    }
    
    if ((e.keyCode == '38') || (e.keyCode == '40') || (e.keyCode == '37') || (e.keyCode == '39')) {
		var operation = 0;
		if ((e.keyCode == '38') || (e.keyCode == '37')) { // up arrow 
			operation = -1;
		}
		if ((e.keyCode == '40') || (e.keyCode == '39')) { // down arrow
			operation = 1;
		}
		old_one_move_num = old_one_move_num + operation;
		select_one_move(old_one_move_num);
	}
}

function save_prefs_server_return(r) {
	if (r == 'ok') {
		f_menu('preferences');
		add_log('<div class="center"><br/>La configuration est sauvegardée sur le serveur.</div>');
		aff_prefs();
	} else {
		clean_log(r);
	}
}

function save_prefs_server() {
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
		add_log('<div class="center"><br/>La configuration est restaurée.</div>');
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

function f_search_players(reverse) {
	if (reverse == null) {
		reverse = true;
	}
	var txt = $('search_player').value;
	if (!window.find(txt, false, reverse)) {
		$("list_players_header").focus();
	}
}

function searchEnter(e) {
	if (e.keyCode == 13) {
		f_search_players(false);
	}
}

window.onload = on_load ; 
window.onresize = resize ;
document.onkeydown = checkKey ;
