#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
import ConfigParser
import rss
from input import check_number

config = ConfigParser.RawConfigParser()
config.read('conf/main.conf')
url = config.get('site', 'url')

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
	print 'Content-type: application/xml\n'
	
	b = bdd.bdd()
	title = ''
	link = url
	parametres = input()
	game_id = parametres.get('game', None)
	if game_id != None:
		if not check_number(game_id):
			print "Numéro de partie invalide"
			exit(1)
			
		title = ", partie #%s" % str(game_id)
		link = url + '/?gid=' + str(game_id)
	
	r = rss.Rss(url, link)
	
	if game_id != None:
		print r.header(url, title, link)
		print r.flux_game(game_id)
		print r.footer()
	
