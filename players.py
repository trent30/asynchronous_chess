#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cgi
import bdd
	
if __name__ == "__main__":
	print "Content-type: text/html\n"
	b = bdd.bdd()
	print '<div id="player_list" style="text-align:left"><br/>Cliquez sur le nom du joueur pour lui proposer une partie.<br/><br/>'
	for i in b.users_list():
		print "<div class='player' id=%s onclick='invite(%s)'>%s</div>" % (i[0], i[0], i[1])
	print '</div>'
