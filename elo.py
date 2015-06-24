#!/usr/bin/env python
# -*- coding: utf-8 -*-

import bdd

b = bdd.bdd()

def p(A, B) :
	diff = B - A
	#~ En pratique la FIDE limite ses calculs en plafonnant la différence à 400 points
	if diff < -400:
		diff = -400
	if diff > 400:
		diff = 400
	return 1/(1 + 10**( float(diff) / 400 ) )
	
def kaf_k(joueur_id):
	"""
	Retourne le coefficient de développement K
	
	http://fr.wikipedia.org/wiki/Classement_Elo :
	 - 40 pour les 30 premières parties,
	 - 20 tant que le joueur est en dessous de 2400 points Elo
	 - 10 qi elo > 2400
	Bizarrement, l'exemple de calcul donnée ensuite utilise K=15
	"""
	
	if b.get_elo(joueur_id) > 2400:
		return 10
	
	if int(b.count_games(joueur_id)) - len(b.list_games(joueur_id)) < 30 :
		return 40
	
	return 20

def elo(joueur_id):
	return b.get_elo(joueur_id)

def new_elo(id_joueur1, id_joueur2, W):
	"""
	W {
		1 : win
		0.5 : nul
		0 : lose
	}
	"""
	
	e1 = elo(id_joueur1)
	e2 = elo(id_joueur2)
	
	diff1 = kaf_k(id_joueur1) * (W - p(e1, e2))
	diff2 = kaf_k(id_joueur2) * (W * - 1 + 1 - p(e2, e1))
	
	e1 += diff1
	e2 += diff2
	
	b.set_elo(id_joueur1, e1)
	b.set_elo(id_joueur2, e2)
	
	return e1, e2


if __name__ == "__main__":
	print new_elo(1, 8, 0)

"""
MODIFICATION DB:

ALTER TABLE users
   ADD COLUMN elo real NOT NULL DEFAULT 1200;
"""
