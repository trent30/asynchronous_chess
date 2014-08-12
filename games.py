#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie

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
	
	b = bdd.bdd()
	liste_games = b.list_games(s)
	if len(liste_games) == 0:
		print "<p>Aucune partie en cours<p/>"
		print "<p>Si vous devez avoir des parties en cours, déconnectez-vous puis reconnectez-vous.<p/>"
		exit(0)
	print "<div id='games' style='text-align: left'>"
	for i in liste_games:
		r = b.get_players(i[0])
		print "<div class='player' onclick='select_game(%s)' id='%s'> %s vs %s<div class='info'>Commencé le %s</div></div>" % (r[0][0], r[0][0], r[0][1], r[0][2], r[0][3].split('.')[0])
	print "</div>"
