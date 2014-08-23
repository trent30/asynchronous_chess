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
	
	parametres = input()
	game = parametres.get("g", -1)
	b = bdd.bdd()
	
	r = {}
	if s == None:
		r['color'] = 'white'
	else:
		uid = b.session_to_user_id(s)
		r['color'] = b.color(game, uid)
	r['players'] = b.get_players(game)[0][1] + ' vs ' + b.get_players(game)[0][2]
	
	print json.dumps(r)
