#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
import json

def input():
	form = cgi.FieldStorage()
	data = {}
	for i in form:
		try:
			data[i] = form[i].value
		except:
			data[i] = ''
	return data

def result_to_dico(i):
	d= {}
	d['id'] = i[0]
	d['text'] = i[1].replace('\n', '<br/>').replace('<', '&lt;').replace('>', '&gt;')
	d['date'] = i[2].split('.')[0][:-3]
	d['login'] = i[3]
	d['status'] = i[4]
	d['nrep'] = b.count_answer_bug(i[0])
	return d;
	
	
if __name__ == "__main__":
	print "Content-type: text/html\n"
	
	b = bdd.bdd()
	parametres = input()
	fixed = parametres.get("fixed", "-1")
	rep = int(parametres.get("rep", "-1"))
	
	r = []
	if rep != -1:
		for i in b.get_thread_bugs(rep):
			r.append(result_to_dico(i))
		print json.dumps(r)
		exit(0)	
	
	r = []
	for i in b.get_bugs():
		if int(fixed) == i[4]:
			r.append(result_to_dico(i))
	
	print json.dumps(r)
