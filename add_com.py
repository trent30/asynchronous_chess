#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import mail
import ConfigParser

config = ConfigParser.RawConfigParser()
config.read('conf/main.conf')

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
	print "Content-type: text/html\n"
	
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
	
	b = bdd.bdd()
	parametres = input()
	game = parametres.get("g", -1)
	com = parametres.get("com", -1)
	num_coup = parametres.get("n", 0)
	login = b.session_to_login(s)
	
	if parametres.get("bug", -1) == "1":
		if parametres.get("status", -1) == -1:
			mail.send_mail(config.get('smtp', 'admin_mail'), \
				config.get('smtp', 'subject_prefix') + ' Erreur', \
				'login : %s  Erreur : %s' % (login, com))
		
		if login == None:
			print "Vous devez être connecté pour rapporter un bug."
			exit(0)
		
		if parametres.get("status", -1) == "2":
			rep = int(parametres.get("rep", 0))
			if rep != 0:
				if rep not in b.list_bug_id():
					print "Votre réponse doit être rattachée à un numéro de bug."
					exit(0)
			
			b.add_bug( com, s, rep )
			mail.send_mail(config.get('smtp', 'admin_mail'), \
				config.get('smtp', 'subject_prefix') + ' Bug report %i de %s' % (rep, login), com)
			print 'ok'
		exit(0)
	
	if s == None:
		print "déco"
		exit(0)
	
	if com == -1:
		m = 'Commentaire vide.'
		print m
		exit(0)
		
	if game == -1:
		m = 'Aucun partie sélectionnée.'
		print m
		exit(0)
	
	try:
		b.add_note( com, game, s, num_coup)
	except:
		print "Erreur lors de l'enregistrement du commentaire."
	else:
		print 'ok'
	
	blanc, noir, winner = b.get_winner(game)[0]
	if winner != None:
		joueur_id = b.session_to_user_id(s)
		url = '<p><a href="%s">Cliquez ici</a> pour visualiser la partie.</p>' % (config.get('site', 'url') + '/?gid=' + str(game))
		sujet = config.get('smtp', 'subject_prefix') + ' Commentaire de ' + b.uid_to_login(joueur_id) + ' #' + str(game)
		coup = int(num_coup) / 2 + 1
		if coup == 0:
			coup = 1
		msg = '<p>Coup %s, commentaire de %s :</p>%s' % (coup, b.uid_to_login(joueur_id), com.replace('\n', '<br/>')) + url
		if joueur_id != blanc and joueur_id != noir:
			#~ Envoi du mail aux deux joueurs
			r = mail.send_mail(b.login_to_mail(b.uid_to_login(blanc)), sujet, msg)
			r = mail.send_mail(b.login_to_mail(b.uid_to_login(noir )), sujet, msg)
		else:
			if joueur_id == blanc :
				#~ Envoi du mail au joueur noir
				r = mail.send_mail(b.login_to_mail(b.uid_to_login(noir)), sujet, msg)
			if joueur_id == noir :
				#~ Envoi du mail au joueur blanc
				r = mail.send_mail(b.login_to_mail(b.uid_to_login(blanc)), sujet, msg)
