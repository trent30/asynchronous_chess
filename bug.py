#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd

def input():
	form = cgi.FieldStorage()
	data = {}
	for i in form:
		try:
			data[i] = cgi.escape(form[i].value, quote=True)
		except:
			data[i] = ''
	return data
	
if __name__ == "__main__":
	parametres = input()
	b = bdd.bdd()
	b.insert_error(parametres.get('g', None), parametres.get('l', None))
	print "Content-type: text/html\n\n"
