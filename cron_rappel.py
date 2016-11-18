#!/usr/bin/env python
# -*- coding: utf-8 -*-

import bdd
import ConfigParser
import mail
import logging

config = ConfigParser.RawConfigParser()
config.read('conf/main.conf')

logging.basicConfig(filename=config.get('log', 'file'), \
	format='%(asctime)s %(levelname)s %(message)s', \
	level=int(config.get('log', 'level')))

b = bdd.bdd()

def send_rappel_mail(_id, joueur_id, game_id):
	mail_to = b.login_to_mail(b.uid_to_login(joueur_id))
	sujet = config.get('smtp', 'subject_prefix') + ' Rappel #' + str(game_id)
	url = config.get('site', 'url') + '/?gid=' + str(game_id)
	msg = open('conf/mail_rappel.txt').read() % (str(game_id), url)
	# test
	#~ print mail_to, sujet, msg
	#~ print '-'*80
	r = mail.send_mail(mail_to, sujet, msg)
	if r == 'ok':
		b.update_rappels(_id)
	else:
		mail.send_mail(config.get('smtp', 'admin_mail'), '[chess]cron', r )
	logging.debug('Mail de rappel à ' + mail_to + ' (partie ' +str(game_id) + '): ' + r)
	
for games in b.parties_en_cours() :
	game_id = games[0]
	joueurs = b.players_from_game(game_id)[0]
	if joueurs[0] == b.get_uid_dernier_joueur(game_id):
		joueur_trait = joueurs[1]
	else:
		joueur_trait = joueurs[0]
	
	liste = []
	for i in b.list_rappels(joueur_trait, game_id):
		if len(b.check_rappels(i[0])) != 0:
			liste.append((i[0], joueur_trait, game_id))
	
	for i in liste:
		if i[1] != None:
			send_rappel_mail(i[0], i[1], i[2])
