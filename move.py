#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
import json
import html
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
		print "déco"
		exit(0)
	
	parametres = input()
	dico_params = {}
	logging.debug('paramètres brutes : ')
	for i in ['gid', 'com', 'flag']:
		dico_params[i] = None
		try:
			dico_params[i] = cgi.escape(parametres.get(i, None).replace("&", "&amp;"), quote=True)
			logging.debug(i + ' : ' + dico_params[i])
		except:
			pass
	dico_params['c'] = parametres.get('c', None)
	logging.debug('coup brute : ' + dico_params['c'])
	
	import coup2txt
	coup = coup2txt.main(json.loads(dico_params['c'], 'UTF-8'))
	logging.debug('coup : ' + coup)
	
	if dico_params['com'] == None:
		dico_params['com'] = ''
	dico_params['com'] = html.encode_html(dico_params['com'])
	
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
		txt = login + ' annonce '
		if dico_params['flag'] == 'A':
			txt += 'son abandon.'
		if dico_params['flag'] == 'E':
			txt += 'échec !'
		if dico_params['flag'] == 'M':
			txt += 'échec et mat !'
	
	if dico_params['c'] == '[]':
		dico_params['c'] = '[{}]'
	
	if txt != '':
		dico_params['c'] = dico_params['c'].replace('}]', ', "flag" : "') + txt + '"}]'
		
	if dico_params['com'] != '':
		dico_params['com'] = 'commentaire de ' + login + ' : ' + dico_params['com']
		dico_params['c'] = dico_params['c'].replace('}]', ', "com" : "') + dico_params['com'] + '"}]'
	
	dico_params['c'] = dico_params['c'].replace('[{,', '[{')
		
	
	# récupère l'email de l'adversaire
	players = b.players_from_game(dico_params['gid'])[0]
	adversaire = ''
	if b.login_to_id(login) == players[1]:
		adversaire = players[0]
	else:
		adversaire = players[1]
	email = b.login_to_mail(b.uid_to_login(adversaire))
	logging.debug('adversaire : ' + b.uid_to_login(adversaire))
	logging.debug('email adversaire : ' + email)
	
	url = config.get('site', 'url') + '/?gid=' + str(dico_params['gid'])
	sujet = config.get('smtp', 'subject_notify') + ' par ' + login + \
		' (#' + str(dico_params['gid']) + ')'
	logging.debug('sujet : ' + sujet)
	
	msg = open('conf/mail_notif.txt').read() % (login, coup, txt, dico_params['com'], url)
	if coup == '':
		msg = msg.replace('a joué :', "n'a pas joué.")
	
	r = mail.send_mail(email, sujet, msg )
	b.add_move(dico_params['gid'], dico_params['c'])
	#~ test local
	#~ r = 'ok'
	print r
	logging.debug(r)
	logging.debug('EOF')
