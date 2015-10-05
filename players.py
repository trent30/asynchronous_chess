#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
import json
import os
from cookie_check import get_cookie
	
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
	
	l = b.players_in_game_with_id(b.session_to_user_id(s))
	parties_en_cours = []
	for i in l:
		parties_en_cours.append(i[0])
	
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
		r.append(dico)
	
	print json.dumps(r)
