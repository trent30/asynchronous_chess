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
		print "Vous n'êtes pas connecté."
		exit(0)
		
	b = bdd.bdd()
	if not b.autorized(s):
		print "Votre session a expirée. Veuillez vous reconnecter (pensez à autoriser les cookies si ce n'est pas le cas)."
		exit(0)
		
	parametres = input()
	user = parametres.get("user", None)
	passwd = parametres.get("pass", None)
	active = parametres.get("active", None)
	
	b.update_free_id(b.session_to_user_id(s), user, passwd, active)
	
	if active == 'true':
		msg = 'Alerte SMS activée'.replace(' ', '%20')
		url = "https://smsapi.free-mobile.fr/sendmsg?user=%s&pass=%s&msg=%s" % (user, passwd, msg)
		if os.system('curl "%s" -' % url) == 0:
			print 'ok';
		else:
			print "Erreur lors de la récupération de smsapi.free-mobile.fr"
	else:
		print 'Les alertes sont maintenant désactivées.'

