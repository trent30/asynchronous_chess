#!/usr/bin/env python
# -*- coding: utf-8 -*-

import bdd

class Rss():
	
	def __init__(self, url, link):
		self.b = bdd.bdd()
		self.url = url
		self.link = link
		
	def balise(self, b, m):
		return '<%s>%s</%s>' % (b, m, b)

	def entry(self, title, link, _id, date, summary):
		data = [title, link, _id, date, summary]
		b = ['title', 'link', 'guid', 'pubDate', 'description']
		r = ''
		for i in xrange(5):
			r += self.balise(b[i], data[i]) + '\n'
		return self.balise('item', r)
		
	def flux_msg(self, game_id, type_msg):
		r = ''
		liste = []
		if type_msg == 0:
			liste = self.b.get_coms(game_id)
			title_type = 'Message'
		if type_msg == 1:
			liste = self.b.get_notes_all(game_id)
			title_type = 'Commentaire'
		for i in liste:
			title = '%s de %s' % (title_type, i[1])
			link = '%s/?gid=%s' % ( self.url, str(game_id) )
			_id = 'urn:uuid:%s-%s' % (str(game_id), i[3].replace(' ', ''))
			r += self.entry(title, link, _id, self.mdate(i[3]), i[0])
		return r
		
	def mdate(self, date):
		return date.split('.')[0].replace(' ', 'T') + 'Z'
		
	def flux_game(self, game_id):
		move = 2
		r = ''
		for i in self.b.get_history_rss(game_id):
			title = str(move/2) + '. '
			if move % 2 != 0:
				title = str(move/2) + '...'
			title += i[0]
			_id = 'urn:uuid:%s-%s' % (str(game_id), move - 2)
			summary = i[0] + ' joué par ' + i[2] + '.'
			r += self.entry(title, self.link, _id, self.mdate(i[1]), summary)
			move += 1
		r += self.flux_msg(game_id, 0)
		winner = self.b.get_winner(game_id)[0][2]
		if winner != None:
			r += self.flux_msg(game_id, 1)
			_id += "-end"
			if winner == 0:
				title = "Partie nulle."
			else:
				title = "%s est victorieux." % self.b.uid_to_login(winner)
			r += self.entry(title, self.link, _id, self.mdate(i[1]), "La partie est terminée.")
		return r
		
	def footer(self):
		print "</channel></rss>"
		exit(0)
		
	def header(self, url,title, link):
		return """<?xml version="1.0" encoding="UTF-8"?>
			<rss version="2.0">
			<channel>
			<title>%s%s</title>
			<description>%s</description>
			<link>%s</link>
			""" % (url,title, link, link)	
