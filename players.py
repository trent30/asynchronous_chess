#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
import json
import os
from cookie_check import get_cookie

def stats(user_id, adversaire, liste):
	win  = 0
	lost = 0
	draw = 0
	for i in liste:
		if adversaire == i[0] or adversaire == i[1]:
			if adversaire == i[2]:
				lost += 1
			if 0 == i[2]:
				draw += 1
			if user_id == i[2]:
				win += 1
	return '%i/%i/%i' % (win, lost, draw)

if __name__ == "__main__":
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
	
	print "Content-type: text/html\n"
	
	b = bdd.bdd()
	
	user_id = b.session_to_user_id(s)
	l = b.players_in_game_with_id(user_id)
	parties_en_cours = []
	for i in l:
		parties_en_cours.append(i[0])
	
	parties_finies = b.list_finish_games_of_id(user_id)
	
	r = []
	for i in b.users_list():
		dico = {}
		dico['id'] = i[0]
		dico['nom'] = i[1]
		dico['elo'] = int(round(i[2]))
		if i[0] in parties_en_cours:
			dico['game'] = 1
		else:
			dico['game'] = 0
		if user_id != i[0]:
			dico['stats'] = stats(user_id, i[0], parties_finies)
		else:
			dico['stats'] = ''
		r.append(dico)
	
	print json.dumps(r)
