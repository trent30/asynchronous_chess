#!/usr/bin/env python
# -*- coding: utf-8 -*-

import bdd
import elo

b = bdd.bdd()

if __name__ == "__main__":
	print """
	ATTENTION ! VOUS NE DEVRIEZ JAMAIS LANCER CE SCRIPT !
	
	Si vous le faites, c'est que vous voulez recalculer tous les points ELO de chaque joueurs, il vous faudra donc faire un : 'update users set elo=1200;' avant.
	
	Si vous savez ce que vous faites et que vous voulez exécuter ce script, commenter la ligne 'exit(0)' sous ce commentaire.
	"""
	
	exit(0)
	
	games = b.list_finish_games()
	for i in games:
		w = 0.5
		if i[0] == i[2]:
			w = 1
		if i[1] == i[2]:
			w = 0
		print i[0], i[1], b.get_elo(i[0]), b.get_elo(i[1]), w, ' → ', 
		print elo.new_elo(i[0], i[1], w)
