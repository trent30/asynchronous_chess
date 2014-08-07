#!/usr/bin/env python
# -*- coding: utf-8 -*-

import Cookie
	
def get_cookie(env):
	cookie = Cookie.SimpleCookie()
	try:
		cookie = Cookie.SimpleCookie(env)
		return cookie
	except (Cookie.CookieError, KeyError):
		return None
