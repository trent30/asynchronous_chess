#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import json

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
		print "disconnected"
		exit(0)
		
	b = bdd.bdd()
	if not b.autorized(s):
		print "disconnected"
		exit(0)
	
	liste_games = b.list_games(s)
	r = []
	for i in liste_games:
		l = b.get_players(i[0])
		dico = {}
		dico['id'] = l[0][0]
		dico['white'] = l[0][1]
		dico['black'] = l[0][2]
		dico['date'] = l[0][3].split('.')[0]
		r.append(dico)
	
	print json.dumps(r)
