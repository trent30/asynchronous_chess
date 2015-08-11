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
	
def erreur(t):
	print '<p>' + t + '</p>'
	print "<p>Retourner sur votre <a onclick=get_page('account.py','account_return'); href='#'>compte</a> pour ressaisir vos identifiants Free."
	exit(0)
	
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
	
	if user == None:
		erreur("Identifiant vide !")
		
	if passwd == None:
		erreur("Code vide !")
		
	if re.match('^[a-zA-Z0-9]*$', user) == None:
		erreur("Identifiant invalide.")
		
	if re.match('^[a-zA-Z0-9]*$', passwd) == None:
		erreur("Code invalide.")
	
	if active not in ['true', 'false']:
		erreur("Checkbox invalide.")
	
	b.update_free_id(b.session_to_user_id(s), user, passwd, active)
	
	if active == 'true':
		r = sms_free.send(user, passwd, 'Alerte SMS activée') 
		if r == 200:
			print 'ok';
		else:
			print "Erreur lors de la récupération de smsapi.free-mobile.fr (erreur : %i)" % r
	else:
		print 'Les alertes sont maintenant désactivées.'

