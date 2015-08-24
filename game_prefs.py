#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import bdd
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
	
	b = bdd.bdd()
	parametres = input()
	uid = b.session_to_user_id(s)
	game_id = parametres.get("g", None)
	interval = parametres.get("set", None)
	
	if uid == None:
		print 'no uid'
		exit(0)
	
	if game_id == None:
		print 'Aucune partie sélectionnée.'
		exit(0)
	
	if interval != None:
		b.set_interval_rappel(interval, uid, game_id)
	
	r = {}
	r['rappel'] = b.get_interval_rappel(uid, game_id)
	
	print json.dumps(r)
