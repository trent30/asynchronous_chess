#!/usr/bin/env python
# -*- coding: utf-8 -*-

import random
import Cookie
import datetime
import hashlib

def token():
	data = str(datetime.datetime.now()) +\
		str(random.randint(0,4294967296))
	m = hashlib.sha512()
	m.update(data)
	return m.hexdigest()

def gen_cookie():
	expiration = datetime.datetime.now() + datetime.timedelta(days=365)
	cookie = Cookie.SimpleCookie()
	cookie["session"] = token()
	cookie["session"]["expires"] = expiration.strftime("%a, %d-%b-%Y %H:%M:%S GMT")
	return cookie

if __name__ == "__main__":
	print token()
	print gen_cookie()
