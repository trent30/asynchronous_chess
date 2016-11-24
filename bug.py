#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
import os
from cookie_check import get_cookie

def input():
	form = cgi.FieldStorage()
	data = {}
	for i in form:
		try:
			data[i] = cgi.escape(form[i].value, quote=True)
		except:
			data[i] = ''
	return data
	
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
		print "Vous n'êtes pas authentifié."
		exit(0)
	
	parametres = input()
	b = bdd.bdd()
	
	gid = parametres.get('g', None)
	if gid != None:
		b.check_duplicate_move(gid)
		
	b.insert_error(\
		gid, \
		b.session_to_user_id(s), \
		parametres.get('c', None))
	print "Le bug est enregistré"
