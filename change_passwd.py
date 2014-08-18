#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
from input import check_input
import bdd
import bcrypt
import os
from cookie_check import get_cookie

def print_page(m):
	print m
	exit(0)
	
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
		print "Vous n'êtes pas connecté."
		exit(0)
		
	b = bdd.bdd()
	if not b.autorized(s):
		print "Votre session a expirée. Veuillez vous reconnecter (pensez à autoriser les cookies si ce n'est pas le cas)."
		exit(0)
		
	formulaire = cgi.FieldStorage()
	passwd = formulaire.getvalue('p')
	
	if passwd == None:
		print_page('Impossible de récupérer lemot de passe')
		
	if len(passwd) < 8:
		print_page('La longueur du mot de passe doit faire au moins 8 caractères')
	
	p = bcrypt.hashpw(passwd, bcrypt.gensalt())
	b.update_passwd(s, p)
	print_page('Votre mot de passe a été modifié.')
