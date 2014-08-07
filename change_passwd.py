#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
from input import check_input

def print_page(m):
	print
	print m
	exit(0)
	
if __name__ == "__main__":
	print "Content-type: text/html"
	formulaire = cgi.FieldStorage()
	passwd = formulaire.getvalue('p')
	token = formulaire.getvalue('t')
	
	if token == None or passwd == None:
		print_page('Impossible de récupérer les paramètres')
		
	if len(passwd) < 8:
		print_page('La longueur du mot de passe doit faire au moins 8 caractères')
	
	if not check_input(token):
		print_page('Caracère apostrophe non autorisé')
		
	import bdd
	b = bdd.bdd()
	
	if not b.autorized(token):
		print_page('Token invalid.')
	else:
		import bcrypt
		p = bcrypt.hashpw(passwd, bcrypt.gensalt())
		b.update_passwd(token, p)
		print_page('Votre mot de passe a été modifié.')
		
		
		
		
