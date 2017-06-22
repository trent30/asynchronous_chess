#!/usr/bin/env python
# -*- coding: utf-8 -*-

import bdd
import elo

b = bdd.bdd()

if __name__ == "__main__":
	print """
	ATTENTION ! VOUS NE DEVRIEZ JAMAIS LANCER CE SCRIPT !
	
	Si vous le faites, c'est que vous voulez recalculer tous les points ELO de chaque joueurs, il vous faudra donc faire un : 'update users set elo=1500;' avant.
	
	Si vous savez ce que vous faites et que vous voulez exécuter ce script, commenter la ligne 'exit(0)' sous ce commentaire.
	"""
	
	exit(0)
	
	games = b.con.query("select white, black, winner, date from games where winner is not null order by date;").getresult()
	for i in games:
		w = 0.5
		if i[0] == i[2]:
			w = 1
		if i[1] == i[2]:
			w = 0
		print i[0], i[1], b.get_elo(i[0]), b.get_elo(i[1]), w, ' → ', 
		e1, e2 = elo.new_elo(i[0], i[1], w)
		b.con.query("INSERT INTO elo (elo, user_id, date) VALUES ('%s', '%s', '%s')" % (e1, i[0], i[3]))
		b.con.query("INSERT INTO elo (elo, user_id, date) VALUES ('%s', '%s', '%s')" % (e2, i[1], i[3]))
