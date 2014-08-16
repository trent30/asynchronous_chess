#!/usr/bin/env python
# -*- coding: utf-8 -*-

# apt-get install python-pygresql python-bcrypt
# pip install bcrypt

import pg
import ConfigParser

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
	
	def session_to_login(self, s):
		return self.requete_0("select login from users where session='%s' \
			and session!='None' and date_deleted is null" % s)
		
	def login_to_session(self, login):
		return self.requete_0("select session from users where login='%s'" % login)

	def update_cookie(self, cookie, login):
		self.con.query("UPDATE users SET session='%s' WHERE login='%s'" % (cookie, login))
		
	def login_exist(self, login):
		r = self.con.query(\
		"select login from users where date_deleted is NULL and login='%s'" % login).getresult()
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
		self.con.query("UPDATE users SET confirmed=TRUE WHERE session='%s'" % s)
		
	def check_password(self, login, password):
		r = self.requete_0(\
		"select passwd from users where date_deleted is NULL and login='%s'" % login)
		if r == None:
			return False
		else:
			import bcrypt
			if bcrypt.hashpw(password, r) == r:
				return True
	
	def update_passwd(self, session, passwd):
		self.con.query("UPDATE users SET passwd='%s' WHERE session='%s'" % \
			(passwd, session) )
		
	def autorized(self, session):
		if session == None:
			return False
		if self.session_to_login(session) == None:
			return False
		else:
			return True
	
	def insert_domain(self, d):
		try:
			self.con.query("INSERT INTO domains(name)VALUES ('%s')" % d)
		except:
			return False
		else:
			return True
			
	def login_to_id(self, login):
		return self.requete_0( \
		"select id from users where date_deleted is NULL and login='%s'" % login)
		
	def domain_to_id(self, domain):
		return self.requete_0("select id from domains where name='%s'" % domain)
	
	def insert_mail(self, email, login):
		mail = email.split('@')[0]
		domain = email.split('@')[1]
		self.insert_domain(domain)
		login_id = self.login_to_id(login)
		domain_id = self.domain_to_id(domain)
		self.con.query("INSERT INTO mails(mail, login_id, domain_id, date_create) VALUES ('%s', '%s', '%s', '%s')" \
			% (mail, login_id, domain_id, 'now()') )
	
	def insert_user(self, login, passwd, token):
		self.con.query("INSERT INTO users(login, passwd, session, date_create) VALUES ('%s', '%s', '%s', '%s')" \
			% (login, passwd, token, 'now()') )
		
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
	
	def login_to_mail(self, login):
		return self.requete_0("SELECT email FROM emails where login='%s'" % login)
	
	def delete_account(self, session):
		login = self.session_to_login(session)
		while (self.login_to_session(login) != None):
			login += '"'
		self.con.query("UPDATE users SET login='%s' WHERE session='%s'" \
			% (login, session))
		self.con.query("UPDATE users SET date_deleted='now()' WHERE session='%s'" \
			% session)
			
	def users_list(self):
		return self.con.query("SELECT u.ID, u.login FROM users u WHERE \
			u.date_deleted is NULL AND u.confirmed=TRUE").getresult()
			
	def add_move(self, game_id, coup):
		self.con.query("INSERT INTO historique (game_id, coup) \
		VALUES ('%s', '%s')" % (game_id, pg.escape_string(coup)))
			
	def add_game(self, white, black):
		self.con.query("INSERT INTO games (white, black, date) \
		VALUES ('%s', '%s', NOW())" % (white, black))
		return self.requete_0("select max(id) from games where \
		white='%s' and black='%s'" % (white, black))
			
	def list_games(self, s):
		return self.con.query("""select * from (SELECT g1.id, date 
			FROM users u, games g1 
			WHERE g1.black=u.id and u.session='%s'
			UNION
			SELECT g2.id, date
			FROM users u, games g2 
			WHERE g2.white=u.id and u.session='%s') a
			order by date
		""" % (s, s) ).getresult()
	
	def get_players(self, game_id):
		return self.con.query("SELECT id, white, black, date FROM v_games_players WHERE id='%s'" % game_id).getresult()
	
	def get_history(self, game_id):
		return self.con.query("SELECT coup FROM historique WHERE game_id='%s' order by id asc" % game_id).getresult()
		
	def	check_gid_uid(self, gid, s):
		if self.requete_0("select session, game from (\
			select u.session, gw.id as game from users u, games gw where \
			u.id = gw.white union select u.session, gb.id as game from \
			users u, games gb where u.id = gb.black ) g\
			where g.session = '%s' and g.game = '%s'" % (s, gid) ) == None:
			return False
		else:
			return True
		
	def uid_to_login(self, uid):
		return self.requete_0("select login from users where id='%s'" % uid)
		
	def color(self, game, id):
		white = self.requete_0("select white from games where id='%s'" % game)
		if white != id:
			return 'black'
		else:
			return 'white'
			
	def players_from_game(self, game):
		return self.con.query("select white, black from games where id='%s'" % game).getresult()
		
	def insert_error(self, game_id, login):
		self.con.query("INSERT INTO error (game_id, login, date) \
		VALUES ('%s', '%s', NOW())" % (game_id, login))
		
		
if __name__ == "__main__":
	a = bdd()
	print a.session_to_login('-1')
