#!/usr/bin/env python
# -*- coding: utf-8 -*-

import smtplib
import ConfigParser
import os
import bdd
import urllib
from time import strftime
import sms_free

config = ConfigParser.RawConfigParser()
config.read('conf/main.conf')

def send_sms(MAIL_TO, subject):
	b = bdd.bdd()
	id_ = b.login_to_id(b.email_to_login(MAIL_TO))
	if id_ == None:
		return
	if b.get_free_sms_state(id_) == "t":
		sms_free.send(b.get_free_user(id_), b.get_free_pass(id_), subject)
	
def send_mail(MAIL_TO, subject, msg):
	send_sms(MAIL_TO, subject)
	MAIL_FROM = config.get('smtp', 'from')
	corps = "Date: %s" % strftime("%a, %d %b %Y %H:%M:%S %z")
	corps += "\nFrom: " + MAIL_FROM
	corps += "\nTo: " + MAIL_TO + "\nSubject: "
	corps += subject + '\n'
	corps += 'Content-Type: text/html; charset=utf-8\n\n'
	corps += msg
	corps += config.get('smtp', 'footer')
	host = config.get('smtp', 'host')
	port = config.get('smtp', 'port')
	try:
		username = config.get('smtp', 'username')
	except:
		username = None
	try:
		password = config.get('smtp', 'password')
	except:
		password = None
	
	if MAIL_TO.split('@')[1] == 'trent.homelinux.org':
		host = '192.168.0.13'
		port = '25'
		username = None
		
	try:
		mail = smtplib.SMTP(host, port)
		mail.starttls()
	except:
		return 'serveur %s:%s injoignable' % (host, port)
		
	if username != None:
		try:
			mail.login(username, password)
		except:
			return "L'authentification au serveur %s:%s a échoué" % (host, port)
	
	try:
		mail.sendmail(MAIL_FROM, MAIL_TO, corps)
	except:
		return "L'envoi du mail a échoué"
	return 'ok'

def send_confirm(MAIL_TO, msg):
	send_mail(MAIL_TO, config.get('smtp', 'subject_prefix') + ' ' + config.get('smtp', 'subject_confirm'), msg)
	
def send_notif(MAIL_TO, msg):
	send_mail(MAIL_TO, config.get('smtp', 'subject_prefix') + ' ' + config.get('smtp', 'subject_notify'), msg)

if __name__ == "__main__":
	pass
	
