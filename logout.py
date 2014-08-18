#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie

if __name__ == "__main__":
	print "Content-type: text/html"
	
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
		print "\nVous n'êtes pas connecté."
		exit(0)
		
	b = bdd.bdd()
	if not b.autorized(s):
		print "\nVotre session a expirée. Veuillez vous reconnecter (pensez à autoriser les cookies si ce n'est pas le cas)."
		exit(0)
	
	b.delete_cookie(s)
	
	import lcookie
	cookie = lcookie.gen_cookie()
	print cookie.output()
	print
	print "Vous êtes déconnecté."
