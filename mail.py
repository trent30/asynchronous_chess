#!/usr/bin/env python
# -*- coding: utf-8 -*-

import smtplib
import ConfigParser

config = ConfigParser.RawConfigParser()
config.read('conf/main.conf')

def send_mail(MAIL_TO, subject, msg):
	MAIL_FROM = config.get('smtp', 'from')
	corps = "From: " + MAIL_FROM
	corps += "\nTo: " + MAIL_TO + "\nSubject: "
	corps += subject + '\n'
	corps += 'Content-Type: text/html; charset=utf-8\n\n'
	corps += msg
	try:
		mail = smtplib.SMTP(config.get('smtp', 'host'), config.get('smtp', 'port'))
	except:
		return 'serveur smtp injoignable'
	try:
		mail.sendmail(MAIL_FROM, MAIL_TO, corps)
	except:
		return "L'envoi du mail a échoué"
	return 'ok'

def send_confirm(MAIL_TO, msg):
	send_mail(MAIL_TO, config.get('smtp', 'subject_confirm'), msg)
	
def send_notif(MAIL_TO, msg):
	send_mail(MAIL_TO, config.get('smtp', 'subject_notify'), msg)

if __name__ == "__main__":
	pass
	
