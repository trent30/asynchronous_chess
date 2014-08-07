#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie

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
	
	parametres = input()
	game = parametres.get("g", -1)
	b = bdd.bdd()
	h = b.get_history(game)
	l = len(h)
	
	if l == 0:
		print '[{}]'
		exit(0)
	
	if l == 1:
		print h[0][0]
		exit(0)
		
	r = '['
	for i in h:
		if i[0] != '[]':
			r += i[0].replace('[', '').replace(']', '') + ','
	r = r[ : len(r) - 1] + ']'
	print r
