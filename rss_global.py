#!/usr/bin/env python
# -*- coding: utf-8 -*-

import bdd
import rss
import ConfigParser
from time import time
import os

config = ConfigParser.RawConfigParser()
config.read('conf/main.conf')
url = config.get('site', 'url')

if __name__ == "__main__":
	print 'Content-type: application/xml\n'
	
	title = 'Flux RSS des parties en cours'
	link = url + '/rss_global.py'
	
	b = bdd.bdd()
	r = rss.Rss(url, link)
	
	fn = 'rss.time'
	
	last_check = int( open(fn, 'r').read().split('.')[0] )
	actual_time = int( time() )
	if actual_time - last_check > 3600:
		d = r.header(url, title, link)
		for i in b.parties_en_cours():
			d += r.flux_game(i[0])
		d += r.footer()
		
		fd = open('rss.xml', 'w+')
		fd.write(d)
		fd.close()
		fd = open(fn, 'w+')
		fd.write(str(actual_time))
		fd.close()

	print open('rss.xml', 'r').read()
