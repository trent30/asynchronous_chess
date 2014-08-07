#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
from input import check_input

if __name__ == "__main__":
	print "Content-type: text/html"
	formulaire = cgi.FieldStorage()
	q = formulaire.getvalue('q')
	if q == None:
		print "\nno data"
		exit(0)
	if not check_input(q):
		print "\nCaractère non autorisé !"
		exit(0)

	b = bdd.bdd()
	login = b.session_to_login(q)
	if login == None:
		print '\nError'
	else:
		b.confirm_account(q)
		import lcookie
		cookie = lcookie.gen_cookie()
		s = cookie["session"].value
		b.update_cookie(s, login)
		print cookie.output()
		print
		print """
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>chess</title>
	</head>
	<body>
		<p>Votre compte est activé. <a href="/">Cliquez ici</a> pour revenir à la page d'accueil.</p>
	</body>
</html>
"""
