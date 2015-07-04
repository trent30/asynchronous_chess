#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import logging
import mail
import ConfigParser

config = ConfigParser.RawConfigParser()
config.read('conf/main.conf')

logging.basicConfig(filename=config.get('log', 'file'), \
	format='%(asctime)s %(levelname)s %(message)s', \
	level=int(config.get('log', 'level')))

logging.debug('-'*20)
logging.debug('finish.py')

def print_page(m):
	html = """
	<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>chess</title>
	</head>
	<body><p>%s</p><a href="/">Retour</a></body></html>
	""" % m
	print html
	exit(0)

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
		print_page("Vous n'êtes pas connecté")
		
	b = bdd.bdd()
	parametres = input()
	game = parametres.get("g", -1)
	
	if game == -1:
		print_page('impossible de récupérer game_ID')
	
	try:
		players = b.players_from_game(game)[0]
	except:
		print_page('Impossible de récupérer les joueurs de cette partie.')
	
	if b.count_move(game) > 2:
		print_page("Cette action n'est plus disponible (trop de coups ont été joués)")
		
	joueur = b.session_to_login(s)
	if b.session_to_user_id(s) not in players:
		print_page("Vous n'êtes pas autorisé à effectuer cette opération.")
	
	try:
		b.delete_game(game)
	except:
		print_page("Une erreur s'est produite lors de l'annulation de cette partie.")
	
	adversaire = ''
	if joueur == players[1]:
		adversaire = players[0]
	else:
		adversaire = players[1]
	
	msg = 'La partie a été annulée par %s.' % joueur
	sujet = config.get('smtp', 'subject_prefix') + ' ' + config.get('smtp', 'subject_abort').replace('Partie', 'Partie #' + str(game))
	r1 = mail.send_mail(b.login_to_mail(joueur), sujet, msg)
	r0 = mail.send_mail(b.login_to_mail(b.uid_to_login(adversaire)), sujet, msg)
	
	if r0 == 'ok' and r1 == 'ok':
		logging.debug('La partie %s a été annulée par %s.' % (game, joueur) )
		print_page("Cette partie est annulée.")
	else:
		print r0 + '<br/>'
		print r1
		logging.debug(r0)
		logging.debug(r1)
		
	logging.debug('EOF')
