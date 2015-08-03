#!/usr/bin/env python
# -*- coding: utf-8 -*-

import urllib

def send(user, passwd, msg):
	params = urllib.urlencode({'user' : user, 'pass' : passwd, 'msg' : msg})
	try:
		r = urllib.urlopen("https://smsapi.free-mobile.fr/sendmsg?%s" % params).getcode()
	except:
		return -2
	else:
		return r

