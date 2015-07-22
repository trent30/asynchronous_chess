#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import random

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
	couleur = parametres.get('couleur', 'blanc')
	
	if uid == None:
		print "Aucun joueur n'est sélectionnée."
		exit(0)
	
	joueur_id = b.session_to_user_id(s)
	
	if couleur == 'pif':
		couleur = random.choice(['noir', 'blanc'])
	
	if couleur == 'blanc':
		white = joueur_id
		black = uid
	else:
		white = uid
		black = joueur_id
		
	if white == black:
		print "Vous êtes combien dans votre tête ? (On ne peut pas créer une partie contre soi-même)."
		exit(0)
	
	gid = b.add_game(white, black)
	
	import mail
	import ConfigParser
	
	email = b.login_to_mail(b.uid_to_login(uid))
	if email == None:
		print "Adversaire introuvable."
		exit(0)
	
	config = ConfigParser.RawConfigParser()
	config.read('conf/main.conf')
	url = config.get('site', 'url') + '/?gid=' + str(gid)
	url2 = config.get('site', 'url') + '/abort.py?g=' + str(gid)
	sujet = config.get('smtp', 'subject_prefix') + ' ' + config.get('smtp', 'subject_invite')
	msg = open('conf/mail_invite.txt').read() % (b.session_to_login(s), url, url2)
	r = mail.send_mail(email, sujet, msg )
	#~ test local
	#~ r = 'ok'
	
	if r == 'ok':
		print 'ok-' + str(gid)
	else:
		print r
