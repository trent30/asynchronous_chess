#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys
import ConfigParser


if os.geteuid() != 0:
    print """Vous devez être root pour exécuter ce script. Si vous ne \
souhaitez pas l'exécuter, vous pouvez faire l'installation manuellement \
en suivant les instructions du fichier setup/README."""
    exit(0)
    
local_path = os.path.abspath(os.path.dirname(sys.argv[0]))

def cmd(c):
    if os.system(c) != 0:
        print "Une erreur s'est produite lors de la commade : %s" % c
        return False
    return True

def user_to_uid(u):
	users = open('/etc/passwd').readlines()
	for i in users:
		if u in i:
			return i.split(':')[2]
	return None

config = ConfigParser.RawConfigParser()
old_config = False
if os.path.isfile('conf/main.conf'):
	old_config = True
	config.read('conf/main.conf')
	print "Le fichier conf/main.conf existe déjà et sera utilisé. Si vous ne \
voulez pas l'utiliser, supprimez-le et relancez l'installation."
else:
    config.read('conf/example.conf')

if old_config == False:
    print "Les questions suivantes vont permettrent de remplir le fichier conf/main.conf"
    print "(Appuyez sur la touche <ENTREE> pour laisser la valeur par défaut)\n"

    for section in config.sections():
        for option in config.options(section):
			print "Saisissez la valeur de [%s] de la section [%s] :" % \
				(option, section)
			print "defaut = %s" % config.get(section, option)
			r = raw_input()
			if r != '':
				config.set(section, option, r)

    print "Enregistrement du fichier de configuration...",
    fd = open('conf/main.conf', 'w')
    config.write(fd)
    fd.close()
    print "Ok"

print "Configuration Apache..."

apache_conf = open("setup/apache.conf").read()
apache_conf = apache_conf.replace('ServerName mydomain', \
    'ServerName ' + config.get("site", "url").replace('http://', '')\
    .replace('https://', ''))
apache_conf = apache_conf.replace('DocumentRoot /var/www/chess', \
    'DocumentRoot ' + local_path + '/' )
apache_conf = apache_conf.replace('<Directory "/var/www/chess', \
    '<Directory  "' +  local_path + '/' )

apache_file_name = '/etc/apache2/sites-available/chess.conf'
try:
    fd = open(apache_file_name, 'w')
except:
    print "Impossible d'ouvrir %s" % apache_file_name
    print "L'installation va continuer mais la configuration pour Apache \
n'est pas bonne. Vous devrez la faire plus tard à la main. Consulter \
le fichier setup/README pour plus de détails."
else:
    fd.write(apache_conf)
fd.close()

cmd("a2ensite chess.conf")

print "Création du USER dans la base de données..."

sql = open('setup/create.sql').read()
sql = sql.replace('OWNER TO chess', 'OWNER TO %s' % config.get("bdd", "user"))

fd = open('/tmp/create.sql', 'w')
fd.write(sql)
fd.close()

try:
	uid = int(user_to_uid('postgres'))
except:
    print "L'utilisateur 'postgres' n'a pas pus être trouvé sur votre système. \
Suivez les instructions du paragraphe 'Base de donées' du fichier setup/README \
en remplaçant les valeurs si besoin pour faire l'installation manuellement."
    exit(0)
    
os.seteuid(uid)
cmd('cd')
host = config.get("bdd", "host")
port = config.get("bdd", "port")
dbname = config.get("bdd", "dbname")
user = config.get("bdd", "user")
password = config.get("bdd", "passwd")

bd_filename = "/tmp/chess_create_user.tmp"
fd_bd = open(bd_filename, 'w')
fd_bd.write("""
CREATE USER %s WITH PASSWORD '%s';
CREATE DATABASE %s;
""" % (user, password, dbname ) )
fd_bd.close()

if cmd("psql -f %s" % bd_filename) == False:
    print "La création de la base de données a échouée, l'installation s'est arrêtée."
    #~ cmd('rm ' + bd_filename)
    exit(0)
cmd('rm ' + bd_filename)


print "Création de la base de données..."

PGPASSFILE_origin = os.environ.get('PGPASSFILE', None)
PGPASSFILE = '/tmp/chess_PGPASSFILE.tmp'
os.environ['PGPASSFILE'] = PGPASSFILE
fd = open(PGPASSFILE, 'w')
fd.write('%s:%s:%s:%s:%s' % (host, port, dbname, user, password))
fd.close()
cmd('chmod 600 %s' % PGPASSFILE)
cmd("psql -h %s -p %s %s %s -w -f %s" % ( \
    host, port, dbname, user, '/tmp/create.sql'))
if PGPASSFILE_origin != None:
    os.environ['PGPASSFILE'] = PGPASSFILE_origin
cmd('rm  %s' % PGPASSFILE)
os.seteuid(0)
cmd('chown www-data:root rss.time rss.xml')
cmd('rm /tmp/create.sql')
cmd('a2enmod expires')


print "Installation terminée."
print "Lancez 'systemctl reload apache2' pour prendre en compte la modification"
print "Vérifiez que %s/conf/main.conf n'est pas accessible." % config.get("site", "url")
