#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
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
	game = parametres.get("g", -1)
	b.check_duplicate_move(game)
	h = b.get_history(game)
	
	r = {}
	coup = []
	for i in h:
		if i[0][0] != '[':
			coup.append(i[0])
	r['h'] = coup
	
	if parametres.get("date", -1) == '1':
		dates = b.get_history_date(game)
		ldate = []
		for i in dates:
			ldate.append(i[0].split('+')[0].split('.')[0] + ' UTC' + i[0][-3:])
		r['date'] = ldate
	
	token = b.get_game_token(game)
	if token != '' and token != None:
		if b.session_to_user_id(s) != int(token.split('_')[0]) and b.session_to_user_id(s) != None:
			r['nulle'] = token
		
	if parametres.get("c", -1) == '1':
		c = b.get_coms(game)
		coms = []
		for i in c:
			dico = {}
			dico['t'] = i[0].replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>')		# le texte
			dico['j'] = i[1]							# le nom du joueur
			dico['n'] = i[2]							# le numéro
			if parametres.get("date_com", -1) == '1':	# la date
				dico['d'] = i[3].split('.')[0][:-3]
			if dico['n'] < 0:
				dico['n'] = 0;
			coms.append(dico)
		r['c'] = coms
	
	if b.session_to_user_id(s) != None:
		n = b.get_notes(game, b.session_to_user_id(s))
		notes = []
		for i in n:
			dico = {}
			dico['t'] = i[0].replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>')	# le texte
			dico['j'] = i[1]							# le nom du joueur
			dico['n'] = i[2]							# le numéro
			if i[4] is not None:
				dico['v'] = i[4]						# la variante
				dico['vn'] = i[5]						# le numéro de début de variante
			else:
				dico['v'] = ""
			if parametres.get("date_com", -1) == '1':	# la date
				dico['d'] = i[3].split('.')[0][:-3]
			if dico['n'] < 0:
				dico['n'] = 0;
			notes.append(dico)
		r['n'] = notes
	
	result = ''
	w = b.get_winner(game)[0]
	if w[2] != None:
		if w[0] == w[2]:
			result = '1-0'
		if w[1] == w[2]:
			result = '0-1'
		if w[2] == 0:
			result = '½-½'
	if result != '':
		r['r'] = result
	
	print json.dumps(r)
