#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import json

def encadre(a):
	if a[0] != '{':
		a = '{' + a
	if a[ -1 : ] != '}':
		a += '}'
	return a

def get_dernier_joueur(l):
	joueur = -1
	while joueur == -1:
		t = l.pop()
		t = t[0][1:][:-1].replace('}, {','},{')
		for i in t.split( '},{'):
			j = json.loads(encadre(i))
			joueur = j.get('j', -1)
	return joueur

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
		print "disconnected"
		exit(0)
		
	b = bdd.bdd()
	if not b.autorized(s):
		print "disconnected"
		exit(0)
	
	liste_games = b.list_games(s)
	r = []
	for i in liste_games:
		l = b.get_players(i[0])
		dico = {}
		dico['id'] = l[0][0]
		dico['joueurs'] = l[0][1] + ' vs ' + l[0][2]
		dico['date'] = l[0][3].split('.')[0]
		dico['trait'] = get_dernier_joueur(b.get_history(l[0][0]))
		r.append(dico)
	
	print json.dumps(r)
