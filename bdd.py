#!/usr/bin/env python
# -*- coding: utf-8 -*-

# apt-get install python-pygresql python-bcrypt
# pip install bcrypt

import pg
import ConfigParser
import json

class bdd():
	
	def __init__(self):
		config = ConfigParser.RawConfigParser()
		config.read('conf/main.conf')
		try:
			self.con = pg.connect(dbname=config.get('bdd', 'dbname'), \
				host=config.get('bdd', 'host'), \
				port=int(config.get('bdd', 'port')), \
				user=config.get('bdd', 'user'), \
				passwd=config.get('bdd', 'passwd'))
		except:
			self.con = None
		else:
			pass
	
	def __exit__(self):
		self.con.close()
		print "exit"
	
	def requete_0(self, s):
		r = self.con.query(s).getresult()
		if len(r) == 0:
			return None
		else:
			return r[0][0]
		
	def save_conf(self, s, data):
		id = self.session_to_user_id(s)
		if id == None:
			return False
		self.con.query("UPDATE users SET conf=%s WHERE id='%s'" % (data, id))
		return True
		
	def restore_conf(self, s):
		id = self.session_to_user_id(s)
		return self.requete_0("select conf from users where id='%s'" % id)
	
	def get_dernier_joueur(self, game_id):
		return self.requete_0("""
			SELECT u.login
			FROM historique h, users u 
			WHERE h.joueur = u.id and game_id='%s' 
			order by h.id desc limit 1;""" % game_id)
			
	def get_uid_dernier_joueur(self, game_id):
		return self.requete_0("""
			SELECT joueur
			FROM historique h
			WHERE game_id='%s' 
			order by h.id desc limit 1;""" % game_id)
			
	def get_date(self, game_id):
		return self.requete_0("SELECT date FROM games WHERE id=%s" % game_id)
			
	def get_elo(self, joueur_id):
		return self.requete_0("SELECT elo FROM users WHERE id='%s';" % joueur_id)
			
	def set_elo(self, joueur_id, elo):
		self.con.query("UPDATE users SET elo=%s WHERE id='%s'" % (elo, joueur_id))
	
	def session_to_login(self, s):
		return self.requete_0("select login from users u, sessions s\
			where s.session='%s' and u.id = s.user_id \
			and s.session!='None' and u.date_deleted is null" % s)
	
	def delete_cookie(self, s):
		self.con.query("DELETE FROM sessions WHERE session like '%s'" % s)
	
	def update_cookie(self, cookie, login):
		id = self.login_to_id(login)
		self.con.query("INSERT INTO sessions (user_id, session) VALUES ('%s', '%s')" % (id, cookie))
	
	def login_exist(self, login):
		r = self.con.query("select login from users \
			where date_deleted is NULL and lower(login)=lower('%s')" % login).getresult()
		if len(r) == 0:
			return False
		else:
			return True
	
	def login_exist_all(self, login):
		r = self.con.query("select login from users \
			where lower(login)=lower('%s')" % login).getresult()
		if len(r) == 0:
			return False
		else:
			return True
	
	def boolean(self, d):
		if d == 't':
			return True
		if d == 'f':
			return False
	
	def confirmed(self, login):
		return self.boolean(self.requete_0(\
			"select confirmed from users where login='%s'" % login))
	
	def confirm_account(self, s):
		id = self.session_to_user_id(s)
		if id == None:
			return
		self.con.query("UPDATE users SET confirmed=TRUE WHERE id='%s'" % id)
	
	def check_password(self, login, password):
		r = self.requete_0("select passwd from users \
			where date_deleted is NULL and login='%s'" % login)
		if r == None:
			return False
		else:
			import bcrypt
			if bcrypt.hashpw(password, r) == r:
				return True
	
	def update_passwd(self, session, passwd):
		id = self.session_to_user_id(session)
		if id == None:
			return
		self.con.query("UPDATE users SET passwd='%s' WHERE id='%s'" % \
			(passwd, id) )
	
	def autorized(self, session):
		if session == None:
			return False
		if self.session_to_login(session) == None:
			return False
		else:
			return True
	
	def insert_domain(self, d):
		try:
			self.con.query("INSERT INTO domains(name) VALUES ('%s')" % d)
		except:
			return False
		else:
			return True
	
	def session_to_user_id(self, s):
		return self.requete_0("select u.id from users u, sessions s \
			where u.id = s.user_id and u.date_deleted is NULL and s.session='%s'" % s)
	
	def login_to_id(self, login):
		return self.requete_0("select id from users \
			where date_deleted is NULL and login='%s'" % login)
	
	def domain_to_id(self, domain):
		return self.requete_0("select id from domains where name='%s'" % domain)
	
	def count_move(self, g):
		return self.requete_0("select count(*) \
		FROM historique where game_id='%s'" % g)
		
	def delete_com(self, g):
		self.con.query("DELETE FROM com WHERE game_id='%s'" % g)
		
	def delete_historique(self, g):
		self.con.query("DELETE FROM historique WHERE game_id='%s'" % g)
		
	def delete_game(self, g):
		self.delete_com(g)
		self.delete_historique(g)
		self.con.query("DELETE FROM games WHERE id='%s'" % g)
	
	def insert_mail(self, email, login):
		mail = email.split('@')[0]
		domain = email.split('@')[1]
		self.insert_domain(domain)
		login_id = self.login_to_id(login)
		domain_id = self.domain_to_id(domain)
		self.con.query("INSERT INTO mails(mail, login_id, domain_id, date_create) VALUES ('%s', '%s', '%s', '%s')" \
			% (mail, login_id, domain_id, 'now()') )
	
	def insert_user(self, login, passwd, token):
		self.con.query("INSERT INTO users(login, passwd, date_create) VALUES ('%s', '%s', '%s')" \
			% (login, passwd, 'now()') )
		self.update_cookie(token, login)
		
	def mail_exist(self, mail):
		if self.requete_0("select * from emails where email='%s'" % mail) == None:
			return False
		else:
			return True
	
	def email_to_login(self, mail):
		return self.requete_0("SELECT u.login FROM users u, domains d, mails m \
			WHERE u.id = m.login_id AND m.domain_id = d.id AND \
			u.date_deleted IS NULL AND concat(m.mail, '@', d.name) = '%s'" \
			% mail)
	
	def update_free_id(self, id, user, passwd, active):
		return self.con.query("UPDATE users set free_user='%s', free_code='%s', alerte_free=%s where id=%s" % ( user, passwd, active, id))
	
	def get_free_sms_state(self, id):
		return self.requete_0("SELECT alerte_free FROM users WHERE id='%s'" % id)
	
	def get_free_user(self, id):
		return self.requete_0("SELECT free_user FROM users WHERE id='%s'" % id)
	
	def get_free_pass(self, id):
		return self.requete_0("SELECT free_code FROM users WHERE id='%s'" % id)
	
	def login_to_mail(self, login):
		return self.requete_0("SELECT email FROM emails where login='%s'" % login)
	
	def delete_account(self, session):
		login = self.session_to_login(session) + '"'
		id = self.session_to_user_id(session)
		if id == None:
			return
		while self.login_exist_all(login):
			login += '"'
		self.con.query("UPDATE users SET login='%s' WHERE id='%s'" \
			% (login, id))
		self.con.query("UPDATE users SET date_deleted='now()' \
			WHERE id='%s'" % id)
	
	def users_list(self):
		return self.con.query("SELECT u.id, u.login, u.elo FROM users u WHERE \
			u.date_deleted is NULL AND u.confirmed=TRUE").getresult()
	
	def get_news(self, uid):
		return self.requete_0("SELECT u.nb_news FROM users u WHERE \
			u.id='%s'" % uid)
			
	def set_news(self, uid, nb):
		self.con.query("UPDATE users SET nb_news='%s' WHERE id='%s'" \
			% (nb, uid))
	
	def add_move(self, game_id, coup, s):
		id = self.session_to_user_id(s)
		self.con.query("INSERT INTO historique (game_id, coup, joueur, date) \
		VALUES ('%s', '%s', '%s', '%s')" \
		% (game_id, pg.escape_string(coup), id, 'now()') )
		self.update_game_token(game_id, '')
	
	def add_game(self, white, black):
		return self.requete_0("INSERT INTO games (white, black, date) \
		VALUES ('%s', '%s', NOW()) RETURNING id;" % (white, black) )
	
	def list_finish_games(self):
		return self.con.query("select white, black, winner from games where winner is not null order by date;").getresult()
	
	def list_games(self, id):
		if id == None:
			return id
		return self.con.query("""select t.id, t.date from (
			SELECT g1.white, g1.black, g1.id, date
			FROM users u, games g1 
			WHERE g1.black=u.id and u.id='%s' and g1.winner is null
			UNION
			SELECT g2.white, g2.black, g2.id, date
			FROM users u, games g2 
			WHERE g2.white=u.id and u.id='%s' and g2.winner is null
			) t,
			users uw, users ub
			where uw.id = t.white and ub.id = t.black and 
			uw.date_deleted is null and ub.date_deleted is null 
			order by t.date
		""" % (id, id) ).getresult()
	
	def list_games_stats_win(self, id):
		return self.con.query("""SELECT t.l_white, t.l_black, t.id, t.date
		FROM v_list_games t
		WHERE t.winner=%s and t.white=%s
		order by date""" % (id, id)).getresult()
		
	def list_games_stats_lose(self, id):
		return self.con.query("""SELECT t.l_white, t.l_black, t.id, t.date
		FROM v_list_games t
		WHERE t.winner!=%s and t.white=%s and t.winner!=0
		order by date""" % (id, id)).getresult()
		
	def list_games_stats_nul(self, id):
		return self.con.query("""SELECT t.l_white, t.l_black, t.id, t.date
		FROM v_list_games t
		WHERE t.white=%s and t.winner=0
		order by date""" % id).getresult()
		
	def list_games_stats_not_finish(self, id):
		return self.con.query("""SELECT t.l_white, t.l_black, t.id, t.date
		FROM v_list_games t
		WHERE t.white=%s and t.winner is null
		order by date""" % id).getresult()
		
	def list_games_stats_total(self, id):
		return self.con.query("""SELECT t.l_white, t.l_black, t.id, t.date
		FROM v_list_games t
		WHERE t.white=%s
		order by date""" % id).getresult()
		
	def set_win(self, game, id):
		self.con.query("UPDATE games SET winner='%s' WHERE id='%s'" \
			% (id, game))
	
	def update_game_token(self, game, token):
		self.con.query("UPDATE games SET token='%s' WHERE id='%s'" \
			% (token, game))

	def get_winner(self, game):
		return self.con.query("select white, black, winner from games WHERE id='%s'" \
			% (game)).getresult()

	def get_game_token(self, game):
		return self.requete_0("select token from games WHERE id='%s'" \
			% (game))
	
	def get_players(self, game_id):
		return self.con.query("SELECT id, white, black, date FROM v_games_players WHERE id='%s'" % game_id).getresult()
	
	def get_history(self, game_id):
		return self.con.query("SELECT coup FROM historique WHERE game_id='%s' order by id asc" % game_id).getresult()
	
	def get_history_date(self, game_id):
		return self.con.query("SELECT timestamptz(date) FROM historique WHERE game_id='%s' order by id asc" % game_id).getresult()
	
	def	add_com(self, com, gid, s):
		id = self.session_to_user_id(s)
		if id == None:
			id = 0
		num_coup = self.requete_0(\
			"select count(*) from historique where game_id='%s'" % gid)
		self.con.query("INSERT INTO com (game_id, text, num_coup, joueur, date, status_id) \
			VALUES ('%s', '%s', '%s', '%s', 'now()', 0)" \
			% (gid, pg.escape_string(com), num_coup, id))
	
	def	get_coms(self, gid):
		return self.con.query("""SELECT c.text, u.login, c.num_coup, date
		FROM com c, users u
		WHERE game_id='%s' 
		and u.id = c.joueur
		and c.status_id = 0
		order by c.id asc""" % gid).getresult()
	
	def list_bug_id(self):
		r = []
		for i in self.con.query("""select id from com where status_id in (2,3)""").getresult():
			r.append(i[0])
		return r
	
	def count_answer_bug(self, n):
		return self.requete_0("""select count(*) \
			from com c where status_id in (2,3) and num_coup='%s'""" % n)
	
	def get_thread_bugs(self, n):
		return self.con.query("""select c.id, c.text, c.date, u.login, c.status_id \
			from com c, users u where c.joueur = u.id and status_id in (2,3) and num_coup='%s' order by date asc""" % n).getresult()
	
	def get_bugs(self):
		return self.con.query("""select c.id, c.text, c.date, u.login, c.status_id \
			from com c, users u where c.joueur = u.id and status_id in (2,3) and num_coup = '0' order by date desc""").getresult()
	
	def	add_bug(self, com, s, n):
		id = self.session_to_user_id(s)
		if id == None:
			id = 0
		return self.requete_0("INSERT INTO com (game_id, text, num_coup, joueur, date, status_id) \
			VALUES (0, '%s', '%s', '%s', 'now()', 2) RETURNING id; " \
			% (pg.escape_string(com), n, id))
	
	def	add_note(self, com, gid, s, n):
		id = self.session_to_user_id(s)
		if id == None:
			id = 0
		num_coup = self.requete_0(\
			"select count(*) from historique where game_id='%s'" % gid)
		self.con.query("INSERT INTO com (game_id, text, num_coup, joueur, date, status_id) \
			VALUES ('%s', '%s', '%s', '%s', 'now()', 1)" \
			% (gid, pg.escape_string(com), n, id))
	
	def	get_other_notes(self, gid, joueur_id):
		return self.con.query("""SELECT c.text, u.login, c.num_coup, c.date
		FROM com c, users u
		WHERE game_id='%s' 
		and u.id = c.joueur
		and c.status_id = 1
		and c.joueur != '%s' 
		order by c.num_coup, c.date asc""" % (gid, joueur_id)).getresult()
		
	def	get_notes(self, gid, joueur_id):
		if self.get_winner(gid)[0][2] == None:
			#~ commentaires privés (la partie n'est pas finie)
			return self.con.query("""SELECT c.text, u.login, c.num_coup, date
			FROM com c, users u
			WHERE game_id='%s' 
			and u.id = c.joueur
			and c.status_id = 1
			and c.joueur = '%s' 
			order by c.id asc""" % (gid, joueur_id)).getresult()
		else:
			#~ commentaires de tout le monde
			return self.con.query("""SELECT c.text, u.login, c.num_coup, date
			FROM com c, users u
			WHERE game_id='%s' 
			and u.id = c.joueur
			and c.status_id = 1
			order by c.id asc""" % gid).getresult()
		
	def	check_gid_uid(self, gid, s):
		id = self.session_to_user_id(s)
		if id == None:
			return False
		if self.requete_0("select id, game from (\
			select u.id, gw.id as game from users u, games gw \
			where u.id = gw.white and gw.winner is null \
			union select u.id, gb.id as game from \
			users u, games gb where u.id = gb.black and gb.winner is null) g\
			where g.id = '%s' and g.game = '%s'" % (id, gid) ) == None:
			return False
		else:
			return True
	
	def stats(self, state, id):
		white = self.requete_0("select count(*) from games \
		where winner='%s' and white='%s'" % (state, id) )
		black = self.requete_0("select count(*) from games \
		where winner='%s' and black='%s'" % (state, id) )
		return white + black
	
	def count_games(self, id):
		white = self.requete_0("select count(*) from games \
		where white='%s'" % id)
		black = self.requete_0("select count(*) from games \
		where black='%s'" % id)
		return white + black
	
	def uid_to_login(self, uid):
		return self.requete_0("select login from users where id='%s'" % uid)
	
	def color(self, game, id):
		white = self.requete_0("select white from games where id=%s" % game)
		if white != id:
			return 'black'
		else:
			return 'white'
		
	def players_from_game(self, game):
		return self.con.query("select white, black from games where id='%s'" % game).getresult()
	
	def insert_error(self, game_id, login_id, texte):
		self.con.query("INSERT INTO error (game_id, login_id, texte, date) \
		VALUES ('%s', '%s','%s', NOW())" % (game_id, login_id, texte))
	
	def max_news(self):
		return self.requete_0("select max(nb_news) + 1 from users")
	
	def parties_en_cours(self):
		return self.con.query("select id from games where winner is null").getresult()

	def list_rappels(self, joueur_id, game_id):
		r = self.requete_0("""
			select count(*)
			from historique
			where game_id=%s
		""" % game_id)
		if r == 0:
			return [(game_id,)]
		
		return self.con.query("""
			select id from rappel as t1
			left join (
				select date, game_id 
				from historique 
				order by date desc limit 1)
				as t2 
			on t2.game_id = t1.game_id where EXTRACT(EPOCH FROM now()) - EXTRACT(EPOCH FROM date) > limite * 3600 and t1.joueur_id=%s and t1.game_id=%s
			""" % (joueur_id, game_id)).getresult()
	
	def check_rappels(self, _id):
		return self.con.query("""
			select * from rappel as t1
			left join (
				select date, game_id 
				from historique 
				order by date desc limit 1)
				as t2 
			on t2.game_id = t1.game_id where EXTRACT(EPOCH FROM now()) - EXTRACT(EPOCH FROM dernier_rappel) > limite * 3600 and t1.id = %s
			""" % _id).getresult()
			
	def update_rappels(self, _id):
		self.con.query('update rappel set dernier_rappel=now() where id=%s;' % _id)
		
	def set_interval_rappel(self, interval, joueur_id, game_id):
		r = self.con.query("""update rappel set limite=%s 
						where joueur_id=%s and game_id=%s;""" \
			% (interval, joueur_id, game_id))
		if r == "0":
			self.con.query("""INSERT INTO rappel (limite, 
						joueur_id, game_id) values(%s, %s, %s);""" \
			% (interval, joueur_id, game_id))
			
	def get_interval_rappel(self, joueur_id, game_id):
		return self.requete_0("""select limite from rappel
			where joueur_id=%s and game_id=%s""" % (joueur_id, game_id))
	
if __name__ == "__main__":
	a = bdd()
	print a.get_dernier_joueur(89)
