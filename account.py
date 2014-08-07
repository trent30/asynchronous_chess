#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import cgi
import bdd
from cookie_check import get_cookie

	
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
		
	b = bdd.bdd()
	login = b.session_to_login(s)
	mail = b.login_to_mail(login)

	print """
<div id='infos' style='text-align:left'> 
Bonjour %s,
<br/>
<br/>
Votre adresse mail est %s
<br/><br/>
<br/>
Vous pouvez changer votre mot de passe ci-dessous :<br/><br/>
<div class='field'>
	<input name="p" id="change_passwd" type="password" />
	<input name='t' value="%s" id="session" type="hidden" />

	<input class='btn' id="btn_login" value="Modifier" type="submit"  onclick="change_password()"/>
</div><br/><br/>
Vous pouvez supprimer votre compte en cliquant sur le bouton ci-dessous :<br/><br/>
<div class='field'>
	<input class='btn' id="btn_login" value="Supprimer" type="submit"  onclick="delete_account()"/>
</div>
""" % (login, mail, s)

