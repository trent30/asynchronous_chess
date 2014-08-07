#!/usr/bin/env python
# -*- coding: utf-8 -*-

pieces = {
	'T' : 'Tour',
	'C' : 'Cavalier',
	'F' : 'Fou',
	'R' : 'Roi',
	'D' : 'Dame',
	'p' : 'Pion'
}
		
couleurs = { 'b' : 'blanc',
	'n' : 'noir'
}
		
def piece2txt(p):
	couleur = couleurs[p[1]]
	piece = pieces[p[0]]
	if piece == 'Tour' or piece == 'Dame':
			if couleur == 'blanc':
				couleur += 'he'
			if couleur == 'noir':
				couleur += 'e'
	return piece + ' ' + couleur;
	
def main(lst):
	txt = ''
	for i in xrange(len(lst)):
		p1 = lst[i]['p1'].encode('UTF-8', 'ascci')
		txt += piece2txt(p1) + ' ' + lst[i]['c1'].encode('UTF-8', 'ascci')
		p2 = lst[i]['p2'].encode('UTF-8', 'ascci')
		if p2 != '':
			txt += ' prend ' + piece2txt(p2)
		txt += ' en ' + lst[i]['c2'].encode('UTF-8', 'ascci') + '<br/>'
	return txt
