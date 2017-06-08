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
		
	if game_token != input_token:
		print "Erreur de token"
		exit(0)
	
	msg = 'La partie est nulle.'
	players = b.players_from_game(game)[0]
	adversaire = ''
	if b.session_to_user_id(s) == players[1]:
		adversaire = players[0]
	else:
		adversaire = players[1]
		
	abort = parametres.get("abort", -1)
	if abort == "True":
		b.update_game_token(game, '')
		com_nulle = '%s refuse la nulle' % (b.session_to_login(s))
		b.add_com(com_nulle, game, None)
		sujet = config.get('smtp', 'subject_prefix') + ' ' + config.get('smtp', 'subject_abort_null').replace('Partie', 'Partie #' + str(game))
		url = url = config.get('site', 'url') + '/?gid=' + game
		msg = open('conf/mail_abort_null.txt').read() % (b.session_to_login(s), url)
		r0 = mail.send_mail(b.login_to_mail(b.uid_to_login(adversaire)), sujet, msg)
		print "ok"
		exit(0)
		
	b.set_win(game, 0)
	b.update_game_token(game, '')
	
	sujet = config.get('smtp', 'subject_prefix') + ' ' + config.get('smtp', 'subject_finish').replace('Partie', 'Partie #' + str(game))
	msg0 = msg + b.get_com(game, adversaire)
	msg1 = msg + b.get_com(game, b.session_to_user_id(s))
	r1 = mail.send_mail(b.login_to_mail(b.session_to_login(s)), sujet, msg1)
	r0 = mail.send_mail(b.login_to_mail(b.uid_to_login(adversaire)), sujet, msg0)
	logging.debug("mail to %s : %s" % (b.session_to_login(s), msg1) )
	logging.debug("mail to %s : %s" % (b.uid_to_login(adversaire), msg0) )
	
	if r0 == 'ok' and r1 == 'ok':
		print "Cette partie est terminée."
	else:
		print r0 + '<br/>'
		print r1
		logging.debug(r0)
		logging.debug(r1)
		
	logging.debug('EOF')
