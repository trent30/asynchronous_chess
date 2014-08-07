#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
from input import check_input

def print_page(m):
	print
	print '<b>%s</b>' % m
	exit(0)

def check_mail(a):
	n, d = a.split('@')
	if n == '' or d == '':
		return False
	return True
	
if __name__ == "__main__":
	print "Content-type: text/html\n"
	formulaire = cgi.FieldStorage()
	login = formulaire.getvalue('l')
	passwd = formulaire.getvalue('p')
	email = formulaire.getvalue('mail')
	
	if login == None or passwd == None or email == None:
		print_page('Impossible de récupérer les paramètres')
		
	if len(passwd) < 8:
		print_page('La longueur du mot de passe doit faire au moins 8 caractères')
		
	if len(login) < 3:
		print_page('La longueur du login doit faire au moins 3 caractères')
	
	if '@' not in email:
		print_page('adresse mail non valide')
	
	for i in [login, passwd, email]:
		if not check_input(i):
			print_page('Caracère apostrophe non autorisé')

	if not check_mail(email):
		print_page('adresse mail non valide')
		
	b = bdd.bdd()
	if b.login_exist(login):
		print_page('Ce login est déjà pris.<br/>')
	if b.mail_exist(email):
		print_page('Cet email est déjà pris.<br/>')
	
	from lcookie import token
	import mail
	import ConfigParser
	
	t = token()
	config = ConfigParser.RawConfigParser()
	config.read('conf/main.conf')
	url = config.get('site', 'url')
	sujet = config.get('smtp', 'subject_confirm')
	msg = open('conf/mail_confirm_account.txt').read() % (url, url, t)
	#~ r = mail.send_mail(email, sujet, msg )
	#~ test local
	r = 'ok'
	
	if r == 'ok':
		import bcrypt
		p = bcrypt.hashpw(passwd, bcrypt.gensalt())
		b.insert_user(login, p, t)
		b.insert_mail(email, login)
		
	print r
		
		
