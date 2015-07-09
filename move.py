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

def get_com(game_id, joueur_id):
	n = b.get_other_notes(game_id, joueur_id)
	notes = '<p>Ci-dessous, les commentaires : </p>'
	for i in n:
		num_coup = i[2] / 2 + 1	
		if num_coup < 0:
			num_coup = 0
		notes += 'Coup %s, commentaire de %s (%s) :<br/>%s<br/><br/>' % (\
			num_coup, \
			i[1], \
			i[3].split('.')[0][:-3], \
			i[0].replace('\n', '<br/>'))
	return notes
	
def msg_elo(old, new):
	diff = new - old
	if diff > 0:
		signe = '+'
	else:
		signe = ''
	return '<p>Votre nouveau classement ELO est : %i (%s%i)</p>' % (int(round(new)), signe, int(round(diff)))

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
		
	if dico_params['gid'] == None:
		print "Aucune partie sélectionnée."
		exit(0)
	
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
	joueur_id = b.session_to_user_id(s)
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
	sujet = config.get('smtp', 'subject_prefix') + ' '
	
	com = dico_params['com']
	if com != '':
		com = 'Message de ' + login + ' :<br/>' + dico_params['com'].replace('\n', '<br/>')
		
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
			msg2 = '<p>Vous avez gagné !</p>' 
			msg += '<p>Vous avez perdu !</p>'
			logging.debug(login_adversaire + ' a perdu.')
			b.set_win(dico_params['gid'], joueur_id)
			e1 = b.get_elo(joueur_id)
			e2 = b.get_elo(adversaire)
			ne1, ne2 = elo.new_elo(joueur_id, adversaire, 1 )
			msg2 += msg_elo(e1, ne1)
			msg += msg_elo(e2, ne2)
			msg2 += get_com(dico_params['gid'], joueur_id)
			msg += get_com(dico_params['gid'], adversaire)
			sujet2 = sujet + 'Vous avez gagné (#' + str(dico_params['gid']) + ')'
			sujet += 'Vous avez perdu (#' + str(dico_params['gid']) + ')'
			r = mail.send_mail(b.login_to_mail(login), sujet2, msg2 )
			logging.debug('sujet du mail au gagnant : ' + sujet2)
			logging.debug('mail au gagnant : ' + r)
			logging.debug('ELO : ' + str(e1) + ',' + str(ne1) + '(gagnant) / ' + str(e2) + ',' + str(ne2) )
		
	if dico_params['flag'] == 'A':
		msg2 = '<p>Vous avez perdu !</p>' 
		msg += '<br/>Vous avez gagné !'
		logging.debug(login_adversaire + ' a gagné par abandon.')
		b.set_win(dico_params['gid'], adversaire)
		e1 = b.get_elo(adversaire)
		e2 = b.get_elo(joueur_id)
		ne1, ne2 = elo.new_elo( adversaire, joueur_id, 1 )
		msg += msg_elo(e1, ne1)
		msg2 += msg_elo(e2, ne2)
		msg2 += get_com(dico_params['gid'], joueur_id)
		msg += get_com(dico_params['gid'], adversaire)
		sujet2 = sujet + 'Vous avez abandonné (#' + str(dico_params['gid']) + ')'
		sujet += 'Vous avez gagné (#' + str(dico_params['gid']) + ')'
		r = mail.send_mail(b.login_to_mail(login), sujet2, msg2 )
		logging.debug('sujet du mail au perdant : ' + sujet2)
		logging.debug('mail au perdant : ' + msg2)
		logging.debug(r)
		logging.debug('ELO : ' + str(e1) + ',' + str(ne1) + '(gagnant) / ' + str(e2) + ',' + str(ne2) )
		
	if dico_params['flag'] == 'D':
		if verification == 2:
			msg += '<br/>La partie est nulle.'
			b.add_move(dico_params['gid'], dico_params['c'], s)
			b.set_win(dico_params['gid'], 0)
			e1 = b.get_elo(joueur_id)
			e2 = b.get_elo(adversaire)
			ne1, ne2 = elo.new_elo( joueur_id, adversaire, 0.5 )
			msg += msg_elo(e1, ne1)
			msg += get_com(dico_params['gid'], joueur_id)
			msg2 += get_com(dico_params['gid'], adversaire)
			sujet += 'Partie nulle (#' + str(dico_params['gid']) + ')'
			r = mail.send_mail(b.login_to_mail(login), sujet, msg )
			logging.debug('ELO : ' + str(e1) + ',' + str(ne1) + '(gagnant) / ' + str(e2) + ',' + str(ne2) )
		else :
			print "Coup invalide ! (la partie n'est pas nulle)"
			exit(0)
		
	if dico_params['flag'] == 'N':
		tmp = '%s vous propose la nulle.' % login
		sujet += tmp
		msg += '<p>' + tmp + '</p>'
		b.update_game_token(dico_params['gid'], str(joueur_id) + '_' + token())
		com_nulle = '%s propose la nulle à %s.' % (login, login_adversaire)
		b.add_com(com_nulle, dico_params['gid'], None)
		
	if dico_params['com'] != '':
		b.add_com(dico_params['com'], dico_params['gid'], s)
	
	if dico_params['flag'] not in ['A', 'N', 'D'] and dico_params['c'] != None and dico_params['c'][-1:] != '#':
		sujet += config.get('smtp', 'subject_notify') + ' par ' + login + ' (#' + str(dico_params['gid']) + ')'
		
	if dico_params['flag'] not in ['A', 'N', 'D'] and dico_params['c'] == None and dico_params['com'] != '':
		sujet += 'Message de ' + login + ' (#' + str(dico_params['gid']) + ')'
		
	r = mail.send_mail(email, sujet, msg )
	#~ test local
	#~ r = 'ok'
	print r
	logging.debug('sujet : ' + sujet)
	logging.debug(msg)
	logging.debug(r)
	logging.debug('EOF')
