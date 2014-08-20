#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie

def deco():
	print "\ndisconnected"
	exit(0)

if __name__ == "__main__":
	print "Content-type: text/html"
	
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
		deco()
		
	b = bdd.bdd()
	if not b.autorized(s):
		deco()
	
	b.delete_cookie(s)
	
	import lcookie
	cookie = lcookie.gen_cookie()
	print cookie.output()
	deco()
