#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
from input import check_input

def print_page(m):
	print
	print m
	exit(0)

def check_mail(a):
	n, d = a.split('@')
	if n == '' or d == '':
		return False
	return True
	
if __name__ == "__main__":
	print "Content-type: text/html"
	formulaire = cgi.FieldStorage()
	mail = formulaire.getvalue('mail')
	
	if mail == None:
		print_page("Impossible de récupérer l'adresse mail")
	
	if '@' not in mail:
		print_page('Adresse mail non valide')
		
	if not check_input(mail):
		print_page('Caracère apostrophe non autorisé')

	if not check_mail(mail):
		print_page('Adresse mail non valide')
		
	b = bdd.bdd()
	if not b.mail_exist(mail):
		print_page("Il n'existe pas de compte pour cette adresse mail")
	
	
	from lcookie import token
	from mail import send_mail
	import ConfigParser
	
	config = ConfigParser.RawConfigParser()
	config.read('conf/main.conf')
	t = token()
	login = b.email_to_login(mail)
	msg = open('conf/mail_forget.txt').read() % \
		(login, config.get('site', 'url'), t)
	#~ r = send_mail(mail, "[chess] récupération de mot de passe",  msg)
	#~ test local
	r = 'ok'
	
	if r == 'ok':
		b.update_cookie( t, login)
		print_page("Un email contenant un lien vient de vous être envoyé. Cliquez sur le lien pour modifier votre mot de passe.")
	else:
		print_page(r)
	
	
		
		
