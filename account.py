#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie
import json

	
if __name__ == "__main__":
	print "Content-type: text/html\n\n"
	
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
		print "Vous n'êtes pas connecté."
		exit(0)
		
	b = bdd.bdd()
	if not b.autorized(s):
		print "Votre session a expirée. Veuillez vous reconnecter (pensez à autoriser les cookies si ce n'est pas le cas)."
		exit(0)
	
	id = b.session_to_user_id(s)
	r = {}
	r['login'] = b.session_to_login(s)
	r['mail'] = b.login_to_mail(r['login'])
	r['elo'] = int(round(b.get_elo(id)))
	r['free_alert'] = b.get_free_sms_state(id)
	r['free_user'] = b.get_free_user(id)
	r['free_pass'] = b.get_free_pass(id)
	
	print json.dumps(r);

