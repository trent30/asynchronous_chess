#!/usr/bin/env python
# -*- coding: utf-8 -*-

def check_input(t):
	if t == None:
		return True
	for i in ['"', "'", "`"]:
		if i in t:
			return False
	return True
	
def check_number(d):
	for i in d:
		if i not in '0123456789':
			return None
	return True
