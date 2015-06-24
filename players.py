#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
import json
import os
from cookie_check import get_cookie
	
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
	r = []
	for i in b.users_list(b.session_to_user_id(s)):
		dico = {}
		dico['id'] = i[0]
		dico['nom'] = i[1]
		dico['elo'] = int(round(i[2]))
		r.append(dico)
	
	print json.dumps(r)
