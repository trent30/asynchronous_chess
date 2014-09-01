#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import json

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
	player_id = parametres.get("i", -1) # pour avoir les stats d'un autre joueur
	detail = parametres.get("p", -1)
	
	if player_id == -1:
		player_id = b.session_to_user_id(s)
		if player_id == None:
			print "disconnected"
			exit(0)
	
	if detail == 'win':
		l = b.list_games_stats_win(player_id)
	if detail == 'lose':
		l = b.list_games_stats_lose(player_id)
	if detail == 'nul':
		l = b.list_games_stats_nul(player_id)
	if detail == 'not_finish':
		l = b.list_games_stats_not_finish(player_id)
	if detail == 'total':
		l = b.list_games_stats_total(player_id)
	
	if detail != -1 :	
		r = []
		for i in l:
			dico = {}
			dico['id'] = i[2]
			dico['date'] = i[3].split('.')[0]
			dico['joueurs'] = i[0] + ' vs ' + i[1]
			r.append(dico)
	else:
		r = {}
		r['win'] = int(b.stats(player_id, player_id))
		r['nul'] = int(b.stats(0,  player_id))
		r['total'] = int(b.count_games(player_id))
		r['not_finish'] = len(b.list_games(s))
		r['lose'] = r['total'] - r['win'] - r['nul'] - r['not_finish']
		
	print json.dumps(r)
