#!/usr/bin/env python
# -*- coding: utf-8 -*-

import random
import Cookie
import datetime

def token():
	return str(datetime.datetime.now()).replace(' ', '_') +\
		'+' + str(random.randint(0,4294967296))\
	
def gen_cookie():
	expiration = datetime.datetime.now() + datetime.timedelta(days=365)
	cookie = Cookie.SimpleCookie()
	cookie["session"] = token()
	cookie["session"]["expires"] = expiration.strftime("%a, %d-%b-%Y %H:%M:%S GMT")
	return cookie

if __name__ == "__main__":
	print token()
	print gen_cookie()
