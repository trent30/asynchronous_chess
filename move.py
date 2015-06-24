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
import subprocess
import elo

config = ConfigParser.RawConfigParser()
config.read('conf/main.conf')

logging.basicConfig(filename=config.get('log', 'file'), \
	format='%(asctime)s %(levelname)s %(message)s', \
	level=int(config.get('log', 'level')))

logging.debug('-'*20)
b = bdd.bdd()

def input():
	form = cgi.FieldStorage()
	data = {}
	for i in form:
		try:
			data[i] = form[i].value
		except:
			data[i] = ''
	return data
	
def check_move(gid, dernier_coup):
	h = b.get_history(gid)
	arg = ['nodejs', 'chess_server_side.js']
	for i in h:
		if i[0][0] != '[':
			arg.append(i[0])
	arg.append(dernier_coup)
	p = subprocess.Popen(arg, stdout=subprocess.PIPE)
	return p.wait()
	
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
	
	dico_params['c'] = parametres.get('c', None)
	coup = parametres.get('c', '')
	
	if b.get_dernier_joueur(int(dico_params['gid'])) == \
		b.session_to_login(s) and dico_params['flag'] != 'A' \
		and coup != '':
		print "Ce n'est pas à votre tour de jouer."
		exit(0)
	
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
	
	login_adversaire = b.uid_to_login(adversaire)
	email = b.login_to_mail(login_adversaire)
	if email == None:
		print "adversaire inconnu."
		exit(0)
	logging.debug('adversaire : ' + login_adversaire)
	logging.debug('email adversaire : ' + email)
	
	url = config.get('site', 'url') + '/?gid=' + str(dico_params['gid'])
	sujet = config.get('smtp', 'subject_notify') + ' par ' + login + \
		' (#' + str(dico_params['gid']) + ')'
	logging.debug('sujet : ' + sujet)
	
	com = dico_params['com']
	if com != '':
		com = 'Commentaire de ' + login + ' :<br/>' + dico_params['com']
		
	msg = open('conf/mail_notif.txt').read() % (login, coup, txt, com, url)
	if coup == '':
		msg = msg.replace('a joué :', "n'a pas joué.")
	
	if dico_params['c'] != None:
		verification = check_move(dico_params['gid'], dico_params['c'])
	else:
		verification = 1
	
	if dico_params['c'] != None:
		if verification == 0:
			b.add_move(dico_params['gid'], dico_params['c'], s)
		else :
			if verification != 2:
				print "Coup invalide !"
				exit(0)
		if dico_params['c'][-1:] == '#':
			b.add_move(dico_params['gid'], dico_params['c'], s)
			msg += '<br/>Vous avez perdu !'
			logging.debug(login_adversaire + ' a perdu.')
			b.set_win(dico_params['gid'], b.session_to_user_id(s))
			e1, e2 = elo.new_elo( b.session_to_user_id(s), adversaire, 1 )
			msg += '<br/>Votre nouveau classement ELO est : %i' % int(round(e2))
		
	if dico_params['flag'] == 'A':
		msg += '<br/>Vous avez gagné !'
		logging.debug(login_adversaire + ' a gagné par abandon.')
		b.set_win(dico_params['gid'], adversaire)
		e1, e2 = elo.new_elo( adversaire, b.session_to_user_id(s), 1 )
		msg += '<br/>Votre nouveau classement ELO est : %i' % int(round(e1))
		
	if dico_params['flag'] == 'D':
		if verification == 2:
			msg += '<br/>La partie est nulle.'
			b.add_move(dico_params['gid'], dico_params['c'], s)
			b.set_win(dico_params['gid'], 0)
			e1, e2 = elo.new_elo( adversaire, b.session_to_user_id(s), 0.5 )
		else :
			print "Coup invalide ! (la partie n'est pas nulle)"
			exit(0)
		
	if dico_params['flag'] == 'N':
		msg += '<br/>Votre adversaire vous propose la nulle.'
		b.update_game_token(dico_params['gid'], str(b.session_to_user_id(s)) + '_' + token())
		com_nulle = '%s propose la nulle à %s.' % (login, login_adversaire)
		b.add_com(com_nulle, dico_params['gid'], None)
		
	if dico_params['com'] != '':
		b.add_com(dico_params['com'], dico_params['gid'], s)
	
	r = mail.send_mail(email, sujet, msg )
	#~ test local
	#~ r = 'ok'
	print r
	logging.debug(msg)
	logging.debug(r)
	logging.debug('EOF')
