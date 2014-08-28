//~ de8caec412546a128f21b96fc2c36370fdfd751c
player_color = 'white';
players = '';
position = {};
prefs = ['ccn', 'ccb', 'pieces'];
actual_position = [];	//~ historique jusqu'au dernier coup "enregistré"
historique = [];		//~ actual_position + bac à sable 
next = [];
log = "";
selection = {
	coord : '',
	color : '',
	html : '',
	piece : ''
	};
selectColor = "#FF0000";
try_get_local_login();
game_ID = try_get_session('gid');

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
	rezise();
	e = document.getElementById('board');
	t = '';
	cases_lettres = [];
	cases_chiffres = [];
	if (player_color == 'white') {
		colonne = 1;
		ligne = 8;
	} else {
		colonne = 8;
		ligne = 1;
	}
	color = 'white';
	for (var i = 1; i < 9; i++) {
		cases_lettres.push(i);
		cases_lettres.push(i + 90);
	}
	for (i = 1; i < 9; i++) {
		cases_chiffres.push(i * 10);
		cases_chiffres.push(i * 10 + 9);
	}
	for(i = 0; i < 100 ; i++ ) {
		var classe='case';
		valeur = '';
		id = 'case_' + i;
		if ([0, 9, 90, 99].indexOf(i) > -1) {
			classe += ' rien';
		}
		if (cases_lettres.indexOf(i) > -1) {
			classe += ' coord';
			c = i;
			if (c > 10) c -= 90;
			if (player_color == 'white') {
				valeur = String.fromCharCode(c + 96);
			} else {
				valeur = String.fromCharCode(9 - c + 96);
			}
		}
		if (cases_chiffres.indexOf(i) > -1) {
			classe += ' coord';
			l = i;
			if (l % 2 !== 0) l -= 9;
			if (player_color == 'black') {
				valeur = l / 10;
			} else {
				valeur = 9 - (l / 10);
			}
		}
		if ( (i > 10) && (i < 89) && (i % 10 !== 0) && ((i + 1) % 10 !== 0)) {
			id = String.fromCharCode(colonne + 96) + ligne;
			sens = true;
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
			e = document.getElementsByClassName(ec[j]);
			for ( i = 0; i < e.length ; i++) { 
				e[i].style.backgroundColor = case_color;
			}
		}
	}
}
	
function draw_pieces(p) {
	var tp = try_get_local("pieces");
	if (tp == '' || tp == null || tp == 'classic') {
		tp = '';
	}
	for(var i in p) {
		id = i + '';
		var e = document.getElementById(id);
		if (e != null) {
			if (p[id] == '') {
				e.innerHTML = '';
			} else {
				e.innerHTML = '<img class="pieces" src="./pieces/' + tp + '/' + p[id] + '.png"</>';
			}
		}
	}
}

function pieceToText(t) {
	if (t == '') return '';
	piece = t[0];
	couleur = t[1];
	p = '';
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
			p =  String.fromCharCode(i + 97) + j;
			position[p] = '';
		}
	}
}

function init_position() {
	clear_position();
	for(var i = 0; i < 8; i++) { /* pions */
		p =  String.fromCharCode(i + 97);
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
		game_info = get_page('/game_info.py?g=' + game_ID).replace(/\n/g, '');
		try {
			var j = JSON.parse(game_info);
			player_color = j.color;
			players = j.players;
		} catch (err) {
			console.log('La récupération des informations de la partie a échouée');
		}
		console.log('game :', game_ID);
		console.log('color :', player_color);
		console.log('joueurs :', players);
		f_reload();
	} else {
		f_option();
	}
	if (player_color == 'black') {
		draw_board();
		draw_pieces(position);
	}
}

function rezise() {
	var w = window.innerWidth - 35;
	h = window.innerHeight - 20;
	min = Math.min(h, w);
	e = document.getElementById('board');
	e.style.width = min;
	e.style.height = min;
	e = document.getElementById('gui');
	e.style.width = w - min - 10;
}

function getPieceFromHtml(t) {
	try {
		return t.split('/pieces/')[1].split('.png')[0];
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

function finish(i) {
	if (confirm("AVERTISSEMENT : cette action est définitive ! Voulez-vous continuer ?")) {
		var r = get_page('/finish.py?g=' + game_ID + '&token=' + 
			actual_position[actual_position.length - 1 ].token);
		if ( r.replace(/\n/g, '') == 'ok') {
			f_reload();
		} else {
			clean_log(r);
		}
	}
}

function coup2log(c) {
	var log = '';
	if (c.com != null) {
		log += '<div onclick="info(this)" class="msg" title="' + c.com + '"><img src="img/msg.png"></div>';
	}
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
		try {
			finish = h[i].flag.substr(h[i].flag.length - 9, 9);
		} catch (err) {
			finish = '';
		}
		if (finish != 'terminée.') {
			var msg = coup2log(h[i]);
			if (h[i].c1 != null) {
				msg += '<div class="num" title="coup joué par ' + joueur + '"> - ' + numero + '</div>';
			}
			add_log(msg);
		}
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
	e = document.getElementById(c);
	e2 = document.getElementById(selection.coord);
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
		arrive = getPieceFromHtml(e.innerHTML);
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
	clean_log(log);
	coup = next.pop();
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
	clean_log(log);
	var e = document.getElementById('log');
	e.style.textAlign = "left";
	piece = ['T', 'C', 'F', 'D', 'R', 'p'];
	couleur = { 'n' : 'white', 'b' : 'black' };
	d = "<p>Sélectionner la pièce de votre choix puis cliquer sur la case de l'échiquier où vous souhaitez la déposer</p>";
	for (var c in couleur) {
		for (var p in piece) {
			nom = piece[p] + c;
			d += '<div id="' + nom + '" onclick=f_click_add("' + nom + '") class="case add ' + couleur[c] + '"><img class="pieces" src="./pieces/' + nom + '.png"</></div>';
		}
		d += '<br/>';
	}
	e.innerHTML = d; 
	e = document.getElementsByClassName('add');
	w = e[0].offsetWidth;
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
	t ='';
	m = {};
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
	if ((e.innerHTML == '8' && player_color == 'black')||
		(e.innerHTML == '1' && player_color == 'white')) {
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

function bug_report(gid) {
	get_page('/bug.py?g=' + gid);
}

function f_reload() {
	if (game_ID == '') {
		alert("aucune partie n'est sélectionnée.");
		return 2;
	}
	check_rotate();
	var j = get_page('/history.py?g=' + game_ID).replace(/\n/g, '');
	if (j == 'no data') {
		alert("Aucune donnée n'a pu être récupérée.");
		return 3;
	}
	if (j == '') {
		j = {};
	}
	try {
		r = JSON.parse(j);
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

function f_home() {
	init();
	clean_log('');
}

function f_del() {
	init();
	clear_position();
	draw_pieces(position);
}

function f_rotate() {
	pc = player_color;
	var e = document.getElementById('case_10');
	if (e.innerHTML == '8') {
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
	l = document.getElementById('log');
	r = diff_historique();
	len = r.length;
	txt = '<div id="send_form">';
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
			log = '';
			return 1;
		}
	}
	historique2log(historique);
	add_log('<hr/>');
}

function get_page(name) {
	var xhr = new XMLHttpRequest();
	url = name.split('?')[0];
	params = name.split('?')[1];
	try {
		xhr.open('POST', url, false); // false = synchrone
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
	if (xhr.readyState == 4 && xhr.status == 200) { 
		return xhr.responseText;
	}
	return "Erreur lors de la récupération de la page " + url;
}

function get_login() {
	user_ID = get_page('/mylogin.py').replace(/\n/g, '');
}

function login() {
	var vlogin = document.getElementById("l_l");
	var vpass = document.getElementById("l_p");
	m = get_page('./login.py?l=' + vlogin.value + '&p=' + vpass.value);
	if (m.replace(/\n/g, '') == 'Bonjour') {
		user_ID = vlogin.value;
		try_set_local("login", user_ID);
		f_option();
	} else {
		clean_log(m);
	}
}

function forget() {
	var mail = document.getElementById("mail_forget");
	var m = get_page('./forget.py?mail=' + mail.value);
	clean_log(m);
}

function change_password() {
	var passwd = document.getElementById("change_passwd");
	var m = get_page('./change_passwd.py?p=' + passwd.value);
	clean_log(m);
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
		m = get_page('/create_account.py?l=' + vlogin.value + '&p=' + vpass.value + '&mail=' + vmail.value).replace(/\n/g, '');
		if (m == 'ok' ) {
			clean_log("<p>Votre compte vient d'être créé, vous allez recevoir un email de confirmation contenant un lien pour activer votre compte.</p><p>Il est possible que le mail soit considéré comme du spam : pensez à vérifier votre dossier spam.</p>");
		} else {
			clean_log(m);
		}
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

function get_stats(id) {
	var url = '/stats.py';
	if (id != '') {
		url += '?i=' + id;
	}
	r = get_page(url);
	if ( r.replace(/\n/g, '') == 'disconnected') {
		menu_login();
		return 1;
	}
	try {
		j = JSON.parse(r);
	} catch(err) {
		clean_log('impossible de parser le JSON des stats.');
		return 2;
	}
	var tr = {'win' : 'parties gagnées',
		'lose' : 'parties perdues',
		'nul' : 'parties nulles',
		'not_finish' : 'parties en cours',
		'total' : '<hr/>Total'};
	clean_log('<br/>');
	stats = '';
	for (var i in tr) {
		stats += '</p>' + tr[i] + ' : ' + j[i] + '</p>';
	}
	var l = document.getElementById('log');
	l.innerHTML = stats;
	l.style.textAlign='center';
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
	if (e !== null) {
		l.innerHTML = e.innerHTML;
	} else {
		clean_log('En attente de la réponse...');
		var r = get_page(m + '.py');
		if ( r.replace(/\n/g, '') == 'disconnected') {
			 menu_login();
			return 0;
		}
		clean_log(r);
	}
	if (m == 'preferences') {
		aff_prefs();
	}
}

function aff_prefs_color_case(variable, defaut, element) {
	var ccb = try_get_local(variable);
	var color = "";
	if (ccb == '' || ccb == null) {
		color = defaut;
	} else {
		color = ccb;
	}
	document.getElementById(element).value = color;
}

function aff_prefs() {
	aff_prefs_color_case("ccb", "#E6E6FA", 'prefs_ccb');
	aff_prefs_color_case("ccn", "#443838", 'prefs_ccn');
	var tp = try_get_local("pieces");
	if (tp != '' && tp != null) {
		document.getElementById("prefs_pieces").value = tp;	
	}
}

function test_prefs() {
	var old = {}
	for (var i in prefs) { // on sauvegarde les valeurs actuelles
		old[prefs[i]] = try_get_local(prefs[i]);
		try_set_local(prefs[i] , document.getElementById("prefs_" + prefs[i]).value);
	}
	// on applique les valeurs de tests
	draw_pieces(position);
	draw_color_case();
	for (var i in prefs) { // on restaure les valeurs de départ
		try_set_local(prefs[i], old[prefs[i]]);
	}
}

function save_prefs() {
	for (var i in prefs) {
		try_set_local(prefs[i] , document.getElementById("prefs_" + prefs[i]).value);
	}
	draw_pieces(position);
	draw_color_case();
	f_option();
}

function invite(id) {
	var r = get_page('/invite.py?id=' + id).replace(/\n/g, '');
	m = r.split('-')[0];
	if (m == 'ok') {
		alert("La partie est créée, un mail a été envoyé à votre adversaire. C'est à vous de commencer !");
		game_ID = r.split('-')[1];
		player_color = 'white';
		f_reload();
	} else {
		clean_log(r);
	}
}

function select_game(id) {
	history.pushState(null, null, "/");
	game_ID = id;
	try_set_session("gid", id);
	clean_log('');
	init();
	l.scrollTop = l.scrollHeight;
}

function send() {
	var com = document.getElementById('com').value;
	com = com.replace(/;/g, "#59semicolon#59");
	com = com.replace(/\?/g, "¿");
	com = com.replace(/&/g, "eperluetteamp");
	com = com.replace(/\+/g, "#43plus#43");
	form = document.getElementById('send_form');
	flag = form.getElementsByClassName('flag');
	flag_value = '';
	r = JSON.stringify(diff_historique());
	url = '/move.py?c=' + r + '&gid=' + game_ID;
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
	
	var ret = get_page(url);
	if (ret.replace(/\n/g, '') == 'ok') {
		var diff = diff_historique();
		flag_tr = {'A' : "Vous avez abandoné",
					'M' : "échec et mat",
					'E' : "échec",
					'P' : "pat"};
		for (i in diff) {
			actual_position.push(diff[i]);
		}
		if (flag_value != '') {
			actual_position[ actual_position.length - 1 ].flag = flag_tr[flag_value];
		}
		if (com != '') {
			actual_position[ actual_position.length - 1 ].com = com;
		}
		var l = document.getElementById('log');
		l.innerHTML = '';
		historique2log(historique);
		add_log('<hr/>');
		return 0;
	}
	if (ret.replace(/\n/g, '') == "déco") {
		menu_login('menu_login');
		return 0;
	}
	clean_log(ret);
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

window.onload = init ; 
window.onresize = rezise ;
