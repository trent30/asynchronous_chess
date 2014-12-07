#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import lcookie

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
		print "Vous n'êtes pas connecté"
		exit(0)
	
	b = bdd.bdd()
	formulaire = cgi.FieldStorage()
	data = formulaire.getvalue('d')
	if b.save_conf(s, "'" + data + "'"):
		print 'ok'
	else:
		print "Une erreur s'est produite"
