#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
import ConfigParser
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
	
def balise(b, m):
	return '<%s>%s</%s>' % (b, m, b)

def entry(title, link, _id, date, summary):
	data = [title, link, _id, date, summary]
	b = ['title', 'link', 'guid', 'pubDate', 'description']
	r = ''
	for i in xrange(5):
		r += balise(b[i], data[i]) + '\n'
	return balise('item', r)
	
def flux_msg(game_id, type_msg):
	r = ''
	liste = []
	if type_msg == 0:
		liste = b.get_coms(game_id)
		title_type = 'Message'
	if type_msg == 1:
		liste = b.get_notes_all(game_id)
		title_type = 'Commentaire'
	for i in liste:
		title = '%s de %s' % (title_type, i[1])
		link = '%s/?gid=%s' % ( url, str(game_id) )
		_id = 'urn:uuid:%s-%s' % (str(game_id), i[3].replace(' ', ''))
		r += entry(title, link, _id, mdate(i[3]), i[0])
	return r
	
def mdate(date):
	return date.split('.')[0].replace(' ', 'T') + 'Z'
	
def flux_game(game_id):
	move = 2
	r = ''
	for i in b.get_history_rss(game_id):
		title = str(move/2) + '. '
		if move % 2 != 0:
			title = str(move/2) + '...'
		title += i[0]
		_id = 'urn:uuid:%s-%s' % (str(game_id), move - 2)
		summary = i[0] + ' joué par ' + i[2] + '.'
		r += entry(title, link, _id, mdate(i[1]), summary)
		move += 1
	r += flux_msg(game_id, 0)
	winner = b.get_winner(game_id)[0][2]
	if winner != None:
		r += flux_msg(game_id, 1)
		_id += "-end"
		if winner == 0:
			title = "Partie nulle."
		else:
			title = "%s est victorieux." % b.uid_to_login(winner)
		r += entry(title, link, _id, mdate(i[1]), "La partie est terminée.")
	return r
	
def end():
	print "</channel></rss>"
	exit(0)
	
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
	
	print """<?xml version="1.0" encoding="UTF-8"?>
	<rss version="2.0">
	<channel>
    <title>%s%s</title>
    <description>%s</description>
    <link>%s</link>
	""" % (url,title, link, link)
	
	if game_id != None:
		print flux_game(game_id)
		end()
	
