#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
from input import check_input
import json

def print_page(m):
	print
	print m
	exit(0)

def error():
	print '\n'
	msg = '<p>Vous avez mal saisi votre login ou votre mot de passe.</p>' + \
		'<p>Si vous avez oublié votre mot de passe, vous pouvez le ' + \
		'récupérer cliquant sur le bouton « Mot de passe oublié ? »</p>'
	print_page(msg)
	
if __name__ == "__main__":
	print "Content-type: text/html"
	formulaire = cgi.FieldStorage()
	login = formulaire.getvalue('l')
	passwd = formulaire.getvalue('p')
	
	if login == None or passwd == None:
		print_page('Vous devez saisir un login et un mot de passe.')
		
	if len(passwd) < 8 or len(login) < 3 or \
		not check_input(login) or not check_input(passwd):
		error()
	
	b = bdd.bdd()
	if b.login_exist(login):
		if b.check_password(login, passwd):
			if not b.confirmed(login):
				print_page("Vous n'avez pas cliqué sur le lien de confirmation qui vous a été envoyé par email lors de la création de votre compte.")
			else:
				import lcookie
				cookie = lcookie.gen_cookie()
				b.update_cookie(cookie["session"].value, login)
				print cookie.output()
				print
				r = {}
				r['BREAKING_NEWS'] = open('news_count.txt').read()
				r['MY_NEWS'] = b.get_news(b.login_to_id(login))
				print json.dumps(r)
				exit(0)

	error()
