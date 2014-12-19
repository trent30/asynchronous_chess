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
	t = parametres.get("t", None)
	passwd = parametres.get('p', None)
	if t != None and passwd == None:
		print open('change_passwd.html').read() % t
		exit(0)
		
	if not b.autorized(s) and t == None:
		print "Votre session a expirée. Veuillez vous reconnecter (pensez à autoriser les cookies si ce n'est pas le cas)."
		exit(0)
	
	if passwd == None:
		print_page('Impossible de récupérer le mot de passe')
		
	if len(passwd) < 8:
		print_page('La longueur du mot de passe doit faire au moins 8 caractères')
	
	p = bcrypt.hashpw(passwd, bcrypt.gensalt())
	b.update_passwd(t, p)
	print_page('Votre mot de passe a été modifié.')
