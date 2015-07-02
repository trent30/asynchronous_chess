#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
import json
import os
from cookie_check import get_cookie
	
if __name__ == "__main__":
	print "Content-type: text/html\n"
	
	b = bdd.bdd()
	r = []
	for i in b.users_list():
		dico = {}
		dico['id'] = i[0]
		dico['nom'] = i[1]
		dico['elo'] = int(round(i[2]))
		r.append(dico)
	
	print json.dumps(r)
