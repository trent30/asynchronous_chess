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
	
	if player_id == -1:
		player_id = b.session_to_user_id(s)
		if player_id == None:
			print "disconnected"
			exit(0)
	
	r = {}
	r['win'] = int(b.stats(player_id, player_id))
	r['nul'] = int(b.stats(0,  player_id))
	r['total'] = int(b.count_games(player_id))
	r['not_finish'] = len(b.list_games(s))
	r['lose'] = r['total'] - r['win'] - r['nul'] - r['not_finish']
	
	print json.dumps(r)
