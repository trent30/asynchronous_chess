#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import re
import sms_free

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
	
	if re.match('^[a-zA-Z0-9]*$', user) == None:
		print "Identifiant invalide."
		exit(0)
		
	if re.match('^[a-zA-Z0-9]*$', passwd) == None:
		print "Code invalide."
		exit(0)
	
	if active not in ['true', 'false']:
		print "Checkbox invalide."
		exit(0)
	
	b.update_free_id(b.session_to_user_id(s), user, passwd, active)
	
	if active == 'true':
		r = sms_free.send(user, passwd, 'Alerte SMS activée') 
		if r == 200:
			print 'ok';
		else:
			print "Erreur lors de la récupération de smsapi.free-mobile.fr (erreur : %i)" % r
	else:
		print 'Les alertes sont maintenant désactivées.'

