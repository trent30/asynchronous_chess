#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
import json
from cookie_check import get_cookie
import logging
import mail
import ConfigParser
from lcookie import token

config = ConfigParser.RawConfigParser()
config.read('conf/main.conf')

logging.basicConfig(filename=config.get('log', 'file'), \
	format='%(asctime)s %(levelname)s %(message)s', \
	level=int(config.get('log', 'level')))

logging.debug('-'*20)

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
		logging.debug('pas de cookie')
		print "déco"
		exit(0)
	
	b = bdd.bdd()
	if not b.autorized(s):
		logging.debug('pas autorisé')
		print "Vous n'êtes pas autorisé à jouer dans cette partie."
		exit(0)
		
	parametres = input()
	dico_params = {}
	logging.debug('paramètres brutes : ')
	for i in ['gid', 'com', 'flag']:
		dico_params[i] = None
		try:
			dico_params[i] = cgi.escape(parametres.get(i, None), quote=True)
			logging.debug(i + ' : ' + dico_params[i])
		except:
			pass
	
	if b.get_dernier_joueur(int(dico_params['gid'])) == \
		b.session_to_login(s) and dico_params['flag'] != 'A':
		print "Ce n'est pas à votre tour de jouer."
		exit(0)
	
	dico_params['c'] = parametres.get('c', None)
	coup = parametres.get('c', '')
	logging.debug('coup : ' + coup)
	
	if dico_params['com'] == None:
		dico_params['com'] = ''
	
	if dico_params['gid'] == None:
		logging.debug("Aucune partie n'est sélectionnée.")
		print "Aucune partie n'est sélectionnée."
		exit(0)
	
	if not b.check_gid_uid(dico_params['gid'], s):
		logging.debug("Vous n'êtes pas autorisé à jouer dans cette partie.")
		print "Vous n'êtes pas autorisé à jouer dans cette partie."
		exit(0)
	
	login = b.session_to_login(s).encode('UTF-8', 'ascci')
	logging.debug('login : ' + login)
	txt = ''
	if dico_params['flag'] != None:
		if dico_params['flag'] == 'A':
			txt += login + ' annonce son abandon.'
		
	# récupère l'email de l'adversaire
	players = b.players_from_game(dico_params['gid'])[0]
	adversaire = ''
	if b.login_to_id(login) == players[1]:
		adversaire = players[0]
	else:
		adversaire = players[1]
	email = b.login_to_mail(b.uid_to_login(adversaire))
	if email == None:
		print "adversaire inconnu."
		exit(0)
	logging.debug('adversaire : ' + b.uid_to_login(adversaire))
	logging.debug('email adversaire : ' + email)
	
	url = config.get('site', 'url') + '/?gid=' + str(dico_params['gid'])
	sujet = config.get('smtp', 'subject_notify') + ' par ' + login + \
		' (#' + str(dico_params['gid']) + ')'
	logging.debug('sujet : ' + sujet)
	
	msg = open('conf/mail_notif.txt').read() % (login, coup, txt, dico_params['com'], url)
	if coup == '':
		msg = msg.replace('a joué :', "n'a pas joué.")
	
	if dico_params['c'] != None:
		b.add_move(dico_params['gid'], dico_params['c'], s)
		if dico_params['c'][-1:] == '#':
			msg += '<br/>Vous avez perdu !'
			b.set_win(dico_params['gid'], b.session_to_user_id(s))
		
	if dico_params['flag'] == 'A':
		msg += '<br/>Vous avez gagné !'
		b.set_win(dico_params['gid'], adversaire)
		
	if dico_params['flag'] == 'D':
		msg += '<br/>La partie est nulle.'
		b.set_win(dico_params['gid'], 0)
		
	if dico_params['flag'] == 'N':
		msg += '<br/>Votre adversaire vous propose la nulle.'
		b.update_game_token(dico_params['gid'], str(b.session_to_user_id(s)) + '_' + token())
	
	if dico_params['com'] != '':
		b.add_com(dico_params['com'], dico_params['gid'], s)
	
	r = mail.send_mail(email, sujet, msg )
	#~ test local
	#~ r = 'ok'
	print r
	logging.debug(r)
	logging.debug('EOF')
