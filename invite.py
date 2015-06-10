#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie

def input():
	form = cgi.FieldStorage()
	data = {}
	for i in form:
		try:
			data[i] = form[i].value
		except:
			data[i] = ''
	return data

if __name__ == "__main__":
	print "Content-type: text/html\n\n"
	
	try:
		env = os.environ["HTTP_COOKIE"]
	except:
		c = None
	else:
		c = get_cookie(env)
		
	try:
		s = c["session"].value
	except:
		s = None
		print "Vous n'êtes pas connecté"
		exit(0)
		
	b = bdd.bdd()
	if not b.autorized(s):
		print "Votre session a expirée. Veuillez vous reconnecter (pensez à autoriser les cookies si ce n'est pas le cas)."
		exit(0)
	
	parametres = input()
	uid = parametres.get('id', None)
	
	if uid == None:
		print "Aucun joueur n'est sélectionnée."
		exit(0)
	
	login = b.session_to_login(s)
	white = b.login_to_id(login)
	gid = b.add_game(white, uid)
	
	import mail
	import ConfigParser
	
	email = b.login_to_mail(b.uid_to_login(uid))
	config = ConfigParser.RawConfigParser()
	config.read('conf/main.conf')
	url = config.get('site', 'url') + '/?gid=' + str(gid)
	url2 = config.get('site', 'url') + '/abort.py?g=' + str(gid)
	sujet = config.get('smtp', 'subject_invite')
	msg = open('conf/mail_invite.txt').read() % (login, url, url2)
	r = mail.send_mail(email, sujet, msg )
	#~ test local
	#~ r = 'ok'
	
	if r == 'ok':
		print 'ok-' + str(gid)
	else:
		print r
