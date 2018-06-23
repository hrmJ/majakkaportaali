#!/bin/bash
#Luo tarvittavat tietokannat, asettaa salasanan ja käyttäjän

PASSWDDB="$(openssl rand -base64 12)"
UNAME="majakkap_user"
printf " un = $UNAME \n pw = $PASSWDDB \n dbname = majakkaportaali \n hostname = localhost\n" > ../config.ini

mysql -e "DROP DATABASE if EXISTS majakkaportaali;"
mysql -e "CREATE DATABASE majakkaportaali /*\!40100 DEFAULT CHARACTER SET utf8 */;"
mysql -e "DROP USER if EXISTS $UNAME";
mysql -e "CREATE USER $UNAME IDENTIFIED BY '$PASSWDDB';"
mysql -e "GRANT ALL PRIVILEGES ON majakkaportaali.* TO '$UNAME';"
mysql -e "FLUSH PRIVILEGES;"



