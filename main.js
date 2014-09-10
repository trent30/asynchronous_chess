//~ b88628b684a47288c08cf59a7c0c512979589508
player_color = 'white';
players = '';
position = {};
prefs = ['ccn', 'ccb', 'pieces', 'size'];
actual_position = [];	//~ historique jusqu'au dernier coup "enregistré"
historique = [];		//~ actual_position + bac à sable 
next = [];
deselect();
selectColor = "#FF0000";
try_get_local_login();
game_ID = try_get_session('gid');
tr = {'win' : 'parties gagnées',
	'lose' : 'parties perdues',
	'nul' : 'parties nulles',
	'not_finish' : 'parties en cours',
	'total' : 'Total'};

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

function draw_board() {
	resize();
	var e = document.getElementById('board');
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
	
function draw_pieces(p) {
	var tp = try_get_local("pieces");
	if (tp == null || tp == '' || tp == 'classic' || tp == 'null') {
		tp = '';
	}
	var cdn = try_get_local("cdn");
	if (cdn == null || cdn.substr(0, 4) != 'http') {
		cdn = '';
	}
	for(var i in p) {
		var id = i + '';
		var e = document.getElementById(id);
		if (e != null) {
			if (p[id] == '') {
				e.innerHTML = '';
			} else {
				e.innerHTML = '<img class="pieces" src="' + cdn + './pieces/' + tp + '/' + p[id] + '.png"</>';
			}
		}
	}
}

function pieceToText(t) {
	if (t == '') return '';
	var piece = t[0];
	var couleur = t[1];
	var p = '';
	var c = '';
	switch(piece) {
		case 'T' : p = 'Tour';
		break;
		case 'C' : p = 'Cavalier';
		break;
		case 'F' : p = 'Fou';
		break;
		case 'R' : p = 'Roi';
		break;
		case 'D' : p = 'Dame';
		break;
		case 'p' : p = 'Pion';
		break;
	}
	if (couleur == 'n') {
		c = ' noir';
		if (piece == 'T' || piece == 'D') {
			c += 'e';
		}
	} else {
		c = ' blanc';
		if (piece == 'T' || piece == 'D') {
			c += 'he';
		}
	}
	return p + c;
}

function clear_position() {
	for(var i = 0; i < 8; i++) {
		for(var j = 1; j < 9; j++) {
			var p =  String.fromCharCode(i + 97) + j;
			position[p] = '';
		}
	}
}

function init_position() {
	clear_position();
	for(var i = 0; i < 8; i++) { /* pions */
		var p =  String.fromCharCode(i + 97);
		position[p + '2'] = 'pb';
		position[p + '7'] = 'pn';
	}
	position.a1 = 'Tb';
	position.b1 = 'Cb';
	position.c1 = 'Fb';
	position.d1 = 'Db';
	position.e1 = 'Rb';
	position.f1 = 'Fb';
	position.g1 = 'Cb';
	position.h1 = 'Tb';
	position.h1 = 'Tb';
	position.a8 = 'Tn';
	position.b8 = 'Cn';
	position.c8 = 'Fn';
	position.d8 = 'Dn';
	position.e8 = 'Rn';
	position.f8 = 'Fn';
	position.g8 = 'Cn';
	position.h8 = 'Tn';
}

function init_return(v) {
	try {
		var j = JSON.parse(v);
		player_color = j.color;
		players = j.players;
	} catch (err) {
		console.log('La récupération des informations de la partie a échouée');
	}
	console.log('game :', game_ID);
	console.log('color :', player_color);
	console.log('joueurs :', players);
	f_reload();
}

function init() {
	var e = document.getElementById('load');
	if (e != null) {
		e.parentNode.removeChild(e);
	}
	draw_board();
	init_position();
	draw_pieces(position);
	historique = [];
	actual_position = [];
	log = '';
	next = [];
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
	if (player_color == 'black') {
		draw_board();
		draw_pieces(position);
	}
}

function min_size() {
	var w = window.innerWidth - 35;
	var h = window.innerHeight - 20;
	return Math.min(h, w);
}

function resize() {
	var min = min_size();
	var e = document.getElementById('board');
	var marge = try_get_local('size');
	if (marge == null || marge == 'null') {
		marge = 0;
	}
	min = min + parseInt(marge);
	e.style.width = min;
	e.style.height = min;
	e = document.getElementById('gui');
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
	var l = document.getElementById('log');
	l.style.textAlign = "right";
	l.innerHTML += '<div class="llog">' + text + '</div>';
	log = l.innerHTML;
	l.scrollTop = l.scrollHeight;
}

function clean_log(t) {
	var l = document.getElementById('log');
	l.innerHTML = t;
	l.scrollTop = l.scrollHeight;
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
		get_page('/finish.py?g=' + game_ID + '&token=' + actual_position[actual_position.length - 1 ].token, 'finish_return');
	}
}

function coup2log(c) {
	var log = '';
	if (c.c1 != null ) {
		log += pieceToText(c.p1) + ' ' + c.c1;
		if (c.p2 !== '') {
			log += ' prend ' + pieceToText(c.p2);
		}
		log += ' en ' + c.c2;
	}
	return log;
}

function historique2log(h) {
	var finish = '';
	var numero = 0;
	var precedent = null;
	var joueur = '';
	for (var i = 0; i < h.length; i++) {
		if (h[i].j != null) {
			joueur = h[i].j;
		} else {
			joueur = '';
		}
		if ( joueur != precedent && h[i].c1 != null) {
			numero = numero + 1;
			precedent = joueur;
		}
		var num = '<div class="num">'+ numero + '</div>';
		var com = '';
		var player = '';
		var coup = '';
		try {
			finish = h[i].flag.substr(h[i].flag.length - 9, 9);
		} catch (err) {
			finish = '';
		}
		if (h[i].com != null) {
			com = '<div onclick="info(this)" class="msg" title="' + h[i].com + '"><img src="img/msg.png"></div>';
		}
		if (finish != 'terminée.') {
			coup = coup2log(h[i]);
			if (h[i].c1 != null) {
				num = '<div class="num" title="coup joué par ' + joueur + '">' + numero + '</div>';
				player = '<div class="msg">coup joué par ' + joueur + '</div>';
			}
		}
		var msg = '';
		var order = try_get_local('order');
		if (order == null) {
			msg = com + coup + ' - ' + num;
		} else {
			order = order.split(',');
			for (var j = 0; j < 4; j++) {
				var aff = try_get_local('order_aff_' + order[j]);
				if (aff == 'true') {
					var value = eval(order[j]);
					msg += value;
					if (j != 3 && aff == 'true' && value != '') {
						msg += ' - ';
					}
				}
			}
		}
		if (msg.substr(msg.length - 3, msg.length) == ' - ') {
			msg = msg.substr(0, msg.length - 3);
		}
		add_log(msg);
		if (h[i].flag != null) {
			add_log( '<div class="msg"><img src="img/info.png"> ' + h[i].flag + '</div>');
		}
	}
	//~ affiche le bouton confirmer uniquement si :
	//~  * le dernier coup possède un flag
	//~  * si ce flag est 'pat' ou 'mat'
	//~  * et si c'est l'adversaire qui a mis le flag
	if (h.length > 0) {
		if (h[h.length - 1].flag != null ) {
			var le_flag = h[h.length - 1].flag.substr(h[h.length - 1].flag.length - 4, 3);
			var auteur = h[h.length - 1].flag.split(' ')[0];
			if ((le_flag == 'pat' || le_flag == 'at ') && (h[h.length - 1].flag.split(' ')[0] != user_ID) ) {
				add_log('<div onclick="finish()" class="btn">CONFIRMER ?</a></div>');
			}
		}
	}
}

function deselect() {
	selection = {
		coord : '',
		color : '',
		html : '',
		piece : ''
		};
}

function f_click(c) {
	var coup = {};
	var e = document.getElementById(c);
	var e2 = document.getElementById(selection.coord);
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
		historique.push(coup);
		if (coup.c1 !== '') {
			position[coup.c1] = '';
		}
		position[c] = selection.piece;
		clean_log(log);
		add_log(coup2log(coup));
		try {
			e2.style.background = selection.color;
			e2.innerHTML = '';
		} catch (error) { /* cas où on ajoute une pièce */
			e.style.background = selection.color;
		}
		e.innerHTML = selection.html;
		deselect();
	}
}

function f_click_add(p) {
	var e = document.getElementById(p);
	if (selection.piece !== '') {
		var e2 = document.getElementById(selection.piece);
		e2.style.background = selection.color;
	}
	selection.coord = '';
	selection.color = e.style.background;
	selection.html = e.innerHTML;
	selection.piece = p;
	e.style.background = selectColor;
}
		
function f_undo() {
	var n = historique.length - 1;
	if (n < 0) {
		console.log('rien à annuler');
		return 1;
	}
	while (historique[n].p1 == null) {
		next.push(historique.pop());
		n -= 1;
	}
	position[historique[n].c2] = historique[n].p2;
	if (historique[n].c1 !== '') {
		position[historique[n].c1] = historique[n].p1;
	}
	draw_pieces(position);
	next.push(historique.pop());
	clean_log('');
	historique2log(historique);
}

function f_next() {
	if (next.length == 0) {
		console.log('rien à restaurer');
		return 1;
	}
	coup = next.pop();
	clean_log(log);
	historique.push(coup);
	if (coup.c1 != null) {
		if (coup.c1 !== '') {
			position[coup.c1] = '';
		}
		position[coup.c2] = coup.p1;
	}
	draw_pieces(position);
	clean_log('');
	historique2log(historique);
}

function f_add() {
	var e = document.getElementById('log');
	e.style.textAlign = "left";
	var piece = ['T', 'C', 'F', 'D', 'R', 'p'];
	var couleur = { 'n' : 'white', 'b' : 'black' };
	var d = "<p>Sélectionner la pièce de votre choix puis cliquer sur la case de l'échiquier où vous souhaitez la déposer</p>";
	for (var c in couleur) {
		for (var p in piece) {
			var nom = piece[p] + c;
			d += '<div id="' + nom + '" onclick=f_click_add("' + nom + '") class="case add ' + couleur[c] + '"><img class="pieces" src="./pieces/' + nom + '.png"</></div>';
		}
		d += '<br/>';
	}
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
	var e = document.getElementById("log");
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
	var e = document.getElementById('case_10');
	if ((e.innerHTML == '<p>8</p>' && player_color == 'black')||
		(e.innerHTML == '<p>1</p>' && player_color == 'white')) {
		f_rotate();
	}
}

function f_init() {
	check_rotate();
	historique = [];
	next = [];
	for (var i = 0; i < actual_position.length; i++) {
		historique.push(actual_position[i]);
	}
	set_position(actual_position);
}

function nothing_return(x) {
	return;
}

function bug_report(gid) {
	get_page('/bug.py?g=' + gid, 'nothing_return');
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
		return 4;
	}
	actual_position = [];
	for (var i = 0; i < r.length; i++) {
		actual_position.push(r[i]);
	}
	window.document.title = 'chess'; // midori ne rafraichi pas le titre sinon
	window.document.title = 'chess #' + game_ID + ' ' + players;
	set_position(r);
	historique = r;
}

function f_reload() {
	if (game_ID == '') {
		alert("aucune partie n'est sélectionnée.");
		return 2;
	}
	check_rotate();
	get_page('/history.py?g=' + game_ID, 'f_reload_return');
}

function f_home() {
	try_set_session('gid', '');
	game_ID = '';
	init();
	clean_log('');
}

function f_del() {
	try_set_session('gid', '');
	game_ID = '';
	init();
	clear_position();
	draw_pieces(position);
}

function f_rotate() {
	var pc = player_color;
	var e = document.getElementById('case_10');
	if (e.innerHTML == '<p>8</p>') {
		player_color = 'black';
	} else {
		player_color = 'white';
	}
	draw_board();
	draw_pieces(position);
	player_color = pc;
}

function f_send() {
	var e = document.getElementById('send_form_origin');
	var l = document.getElementById('log');
	var r = diff_historique();
	var len = r.length;
	var txt = '<div id="send_form">';
	clean_log('');
	if (len == 0) {
		txt += "Aucun coup n'a été joué";
	}
	if (len == 1) {
		txt += 'Le coup suivant va être envoyé :';
	}
	if (len > 1) {
		txt += 'La liste des coups suivants va être envoyée :';
	} 
	txt += '<br/><br/>';
	for (var i = 0; i < len; i++) {
		txt += coup2log(r[i]) + '<br/>';
	}
	l.innerHTML = txt + e.innerHTML + '</div>';
}

function diff_historique() {
	var diff = historique.length - actual_position.length;
	var r = [];
	for (var i = 0; i < diff; i++) {
		r.unshift(historique[historique.length - 1 - i]);
	}
	return r;
}

function set_position(historique) {
	clean_log('INFORMATION : les coups que vous jouez ici sont considérés comme un «&nbsp;brouillon&nbsp;», il faut cliquer sur le bouton «&nbsp;envoyer&nbsp;» pour valider vos modifications.<hr/>');
	init_position();
	var n = historique.length;
	for (var i = 0; i < n; i ++) {
		if (historique[i].p1 != null) {
			if (historique[i].c1 != null) {
				position[historique[i].c1] = '';
				position[historique[i].c2] = historique[i].p1;
			}
		}
	}
	draw_pieces(position);
	next = [];
	if (n < 2) {
		if (historique[0].p1 == null) {
			console.log("L'historique est vide");
			return 1;
		}
	}
	historique2log(historique);
	add_log('<hr/>');
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
	var vlogin = document.getElementById("l_l").value;
	var vpass = document.getElementById("l_p").value;
	get_page('./login.py?l=' + vlogin + '&p=' + vpass, 'login_return', vlogin);
}

function aff_return(r) {
	clean_log(r);
}

function forget() {
	var mail = document.getElementById("mail_forget");
	get_page('./forget.py?mail=' + mail.value, 'aff_return');
}

function change_password() {
	var passwd = document.getElementById("change_passwd");
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
	var vlogin = document.getElementById("ca_l");
	var vpass = document.getElementById("ca_p");
	var vmail = document.getElementById("ca_mail");
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
	var e = document.getElementById("log");
	e.style.textAlign = "center";
	return 0;
}

function list_games(detail) {
	get_page('stats.py?p=' + detail, 'games_return', tr[detail]);
}

function get_stats_return(r) {
	if ( r == 'disconnected') {
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
	var stats = "<p style='text-align:left;'>Cliquez sur l'élément pour afficher les parties correspondantes</p><hr/>";
	for (var i in tr) {
		if (i == 'total') {
			stats += '<hr/>';
		}
		stats += '<p class="stats" onclick=list_games("' + i + '")>' + tr[i] + ' : ' + j[i] + '</p>';
	}
	var l = document.getElementById('log');
	l.innerHTML = stats;
}

function get_stats(id) {
	var url = '/stats.py';
	if (id != '') {
		url += '?i=' + id;
	}
	get_page(url, 'get_stats_return');
}

function f_menu_return(r) {
	if (r == 'disconnected') {
		menu_login();
		return 0;
	}
	clean_log(r);
}

function account_return(r) {
	var e = document.getElementById('account').innerHTML;
	var l = document.getElementById('log');
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
	var l = document.getElementById('log');
	var j = JSON.parse(r);
	var e = '';
	if (j.length == 0) {
		e += "<p>Aucune partie disponible.<p/>";
		e += "<p>Si vous devez avoir des parties en cours, déconnectez-vous puis reconnectez-vous.<p/>";
	} else {
		e = '<h3>' + title + '</h3>';
		for (var i in j) {
			var trait = '';
			if (j[i].trait != null && j[i].trait != user_ID) {
				trait = ' (*)';
			}
			e += "<div class='player' onclick='select_game(" + j[i].id + ")' id=" + j[i].id + ">" + j[i].joueurs + trait + "<div class='info'>Commencée le " + j[i].date + "</div></div>";
		}
	}
	if (title == 'parties en cours') {
		e += "<div style='font-size: smaller;'><br/><br/>(*) : cette marque indique que c'est à vous de jouer.</div>";
	}
	l.innerHTML = e;
	l.style.textAlign = 'left';
}

function players_return(r) {
	var l = document.getElementById('log');
	var j = JSON.parse(r);
	var e = '<br/>Cliquez sur le nom du joueur pour lui proposer une partie.<br/><br/>';
	if (j.length == 0) {
		e += "<p>Aucun joueur<p/>";
	} else {
		for (var i in j) {
			e += "<div class='player' id=" + j[i].id + " onclick='invite(" + j[i].id + ")'>" + j[i].nom + "</div>";
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
	var e = document.getElementById(m);
	var l = document.getElementById('log');
	if (m == 'logout' || m == 'delete_account') {
		user_ID = '';
		try_set_local("login", '');
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
		get_page(m + '.py', 'games_return', 'parties en cours');
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
	document.getElementById(element).value = color;
}

function aff_prefs() {
	aff_prefs_color_case("ccb", "#E6E6FA", 'prefs_ccb');
	aff_prefs_color_case("ccn", "#443838", 'prefs_ccn');
	aff_prefs_color_case("size", "0", 'prefs_size');
	var tp = try_get_local("pieces");
	if (tp != '' && tp != null && tp != 'null') {
		document.getElementById("prefs_pieces").value = tp;	
	}
	var range = document.getElementById('range');
	range.min = min_size() * -1;
	var order = try_get_local('order');
	if (order != null) {
		var tr2 = {'com' : 'commentaire',
			'coup' : 'coup',
			'num' : 'numéro',
			'player' : 'joueur' };
		for (var i = 1; i < 5; i++) {
			var input = document.getElementById('order_cb_' + i);
			var e = document.getElementById('order_' + i);
			var v = order.split(',')[i-1];
			input.value = v;
			var ic = try_get_local('order_aff_' + v);
			if (ic == 'false') {
				input.checked = false;
			} else {
				input.checked = true;
			}
			e.innerHTML = tr2[v];
		}
	} else {
		order = ['com', 'coup', 'num', 'player'];
		for (var i = 1; i < 5; i++) {
			var input = document.getElementById('order_cb_' + i);
			var v = order[i-1];
			if (v != 'player') {
				input.checked = true;
			} else {
				input.checked = false;
			}
		}
	}
}

function test_prefs() {
	var old = {};
	for (var i in prefs) { // on sauvegarde les valeurs actuelles
		old[prefs[i]] = try_get_local(prefs[i]);
		try_set_local(prefs[i] , document.getElementById("prefs_" + prefs[i]).value);
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
		try_set_local(prefs[i] , document.getElementById("prefs_" + prefs[i]).value);
	}
	var order = '';
	for (i = 1; i < 5; i++) {
		var e = document.getElementById('order_cb_' + i);
		order += e.value + ',';
		try_set_local('order_aff_' + e.value, e.checked);
	}
	try_set_local('order', order);
	draw_pieces(position);
	draw_color_case();
	resize();
	f_option();
}

function f_order_click(e) {
	var n = parseInt(e.split('order_')[1]);
	var n2 = n + 1;
	if (n == 4) {
		for (var i = 3; i > 0; i--) {
			f_order_click('order_' + i);
		}
		return;
	}
	var selection = document.getElementById('order_' + n);
	var next = document.getElementById('order_' + n2);
	var tmp = selection.innerHTML;
	selection.innerHTML = next.innerHTML;
	next.innerHTML = tmp;
	var check = document.getElementById('order_cb_' + n);
	var check2 = document.getElementById('order_cb_' + n2);
	var tmp_check = check.checked;
	var tmp_value = check.value;
	check.checked = check2.checked;
	check2.checked = tmp_check;
	check.value = check2.value;
	check2.value = tmp_value;
}

function invite_return(r) {
	var m = r.split('-')[0];
	if (m == 'ok') {
		alert("La partie est créée, un mail a été envoyé à votre adversaire. C'est à vous de commencer !");
		game_ID = r.split('-')[1];
		player_color = 'white';
		f_reload();
	} else {
		clean_log(r);
	}
}

function invite(id) {
	get_page('/invite.py?id=' + id, 'invite_return');
}

function select_game(id) {
	history.pushState(null, null, "/");
	game_ID = id;
	try_set_session("gid", id);
	clean_log('');
	init();
	var l = document.getElementById('log');
	l.scrollTop = l.scrollHeight;
}

function send_return(r) {
	if (r == 'ok') {
		var diff = diff_historique();
		var flag_tr = {'A' : "Vous avez abandoné",
					'M' : "échec et mat",
					'E' : "échec",
					'P' : "pat"};
		for (var i in diff) {
			diff[i].j = user_ID;
			actual_position.push(diff[i]);
		}
		if (diff.length == 0) {
			actual_position.push({});
		}
		if (flag_value != '') {
			actual_position[ actual_position.length - 1 ].flag = flag_tr[flag_value];
		}
		if (com != '') {
			actual_position[ actual_position.length - 1 ].com = com;
		}
		var l = document.getElementById('log');
		l.innerHTML = '';
		historique2log(actual_position);
		add_log('<hr/>');
		return 0;
	}
	if (r == "déco") {
		menu_login('menu_login');
		return 0;
	}
	clean_log(r);
}

function send() {
	com = document.getElementById('com').value;
	com = com.replace(/;/g, "#59semicolon#59");
	com = com.replace(/\?/g, "¿");
	com = com.replace(/&/g, "eperluetteamp");
	com = com.replace(/\+/g, "#43plus#43");
	form = document.getElementById('send_form');
	var flag = form.getElementsByClassName('flag');
	flag_value = '';
	var r = JSON.stringify(diff_historique());
	var url = '/move.py?c=' + r + '&gid=' + game_ID;
	for (var i = 0; i < flag.length ; i++) {
		if (flag[i].checked) {
			flag_value += flag[i].value;
		}
	}
	if (com.length != 0) {
		url += '&com=' + com;
	}
	if (flag_value.length != 0) {
		url += '&flag=' + flag_value;
		if (flag_value == 'A') {
			if (!confirm('Attention ! Cette action est définitive, voulez-vous vraiment abandonner et perdre cette partie ?')) {
				return;
			}
		}
	}
	/* vérification que tout n'est pas vide */
	if (diff_historique().length == 0 && com.length == 0 && flag_value.length == 0) {
		alert("Vous n'avez rien à envoyer.");
		return 2;
	}
	get_page(url, 'send_return');
}

function info(t) {
	//~ Affichage des commentaires d'un coup
	var txt = document.createTextNode(t.title);
	if (t.textContent.length != 0) {
		t.removeChild(t.lastChild);
	} else {
		t.appendChild(txt);
	}
}

function on_load() {
	var cdn = try_get_local('cdn');
	if (cdn != null) {
		var e = document.getElementById('gui').getElementsByTagName('img');
		for (var i = 0; i < e.length; i++) {
			e[i].src = cdn + 'img/' + e[i].src.split('img/')[1];
		}
	}
	init();
}

function UpdateSizeBoardValue(s) {
	var t = document.getElementById('prefs_size');
	t.value = s;
}

function checkEnter(e) {
	if (e.keyCode == 13) {
		login();
	}
}

window.onload = on_load ; 
window.onresize = resize ;
