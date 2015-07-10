#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import bdd

def input():
	form = cgi.FieldStorage()
	data = {}
	for i in form:
		try:
			data[i] = form[i].value
		except:
			data[i] = ''
	return data

if __name__ == "__main__":
	print "Content-type: text/html\n"

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
	parametres = input()
	uid = b.session_to_user_id(s)
	breaking_news = open('news_count.txt').read()
	
	if parametres.get("html", -1) == "1":
		print open('news.html').read()
		if uid == None:
			print 'no uid'
			exit(0)
		else:
			b.set_news(uid, int(breaking_news))
		exit(0)
	
	print 'BREAKING_NEWS = %s;' % breaking_news
	
	if uid == None:
		print 'MY_NEWS = %i;' % (int(breaking_news) - 1)
		exit(0)
	
	n = b.get_news(uid)
	if n == None:
		n = 'null'
	else:
		n = str(n)
	print 'MY_NEWS = %s;' % n
