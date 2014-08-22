#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie

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
		
	if game_token[0] == '+': 
		#~ si c'est le flag « échec et mat » l'adversaire gagne
		players = b.players_from_game(game)[0]
		adversaire = ''
		if b.session_to_user_id(s) == players[1]:
			adversaire = players[0]
		else:
			adversaire = players[1]
		b.set_win(game, adversaire)
	else:
		#~ sinon c'est match null
		b.set_win(game, 0)
	
	msg_end = "Cette partie est terminée."
	b.update_game_token(game, '')
	b.add_move(game, '[{"flag" : "' + msg_end + '"}]')
	print msg_end
		
	
