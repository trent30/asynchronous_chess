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
		print "disconnected"
		exit(0)
		
	b = bdd.bdd()
	parametres = input()
	game = parametres.get("g", -1)
	if game == -1:
		print 'impossible de récupérer game_ID'
		exit(0)
		
	input_token = parametres.get("token", -1)
	if input_token == -1:
		print 'impossible de récupérer le token'
		exit(0)
	
	game_token = b.get_game_token(game)
	if game_token == None:
		print "Cette action n'est plus disponible"
		exit(0)
	
	msg = ''
	players = b.players_from_game(game)[0]
	adversaire = ''
	if b.session_to_user_id(s) == players[1]:
		adversaire = players[0]
	else:
		adversaire = players[1]
		
	if game_token[0] == '+': 
		#~ si c'est le flag « échec et mat » l'adversaire gagne
		b.set_win(game, adversaire)
		msg = b.uid_to_login(adversaire) + ' est victorieux !'
	else:
		#~ sinon c'est match null
		b.set_win(game, 0)
		msg = 'La partie est nulle'
	
	msg_end = "Cette partie est terminée."
	b.update_game_token(game, '')
	b.add_move(game, '[{"flag" : "' + msg_end + '"}]')
	
	sujet = config.get('smtp', 'subject_finish').replace('Partie', 'Partie #' + str(game))
	r1 = mail.send_mail(b.login_to_mail(b.session_to_login(s)), sujet, msg)
	if 'victorieux' in msg:
		msg = 'Vous êtes victorieux !'
	r0 = mail.send_mail(b.login_to_mail(b.uid_to_login(adversaire)), sujet, msg)
	
	if r0 == 'ok' and r1 == 'ok':
		print msg_end
	else:
		print r0 + '<br/>'
		print r1
		logging.debug(r0)
		logging.debug(r1)
		
	logging.debug('EOF')
