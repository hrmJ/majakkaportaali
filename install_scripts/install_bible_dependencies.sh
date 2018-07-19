#! /bin/bash

cd /opt/
mkdir -p sword_modules 
wget https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/FinPR92.zip
#pura ja muokkaa kansiorakennetta hieman
unzip  FinPR92.zip -d sword_modules/FinPR92 #Raamatun lataava skripti olettaa sijainniksi tämän
mv sword_modules/FinPR92/modules/texts/ztext/finpr92/ sword_modules/

UNAME="majakkap_user"
mysql -e "DROP DATABASE if EXISTS bibles;"
mysql -e "CREATE DATABASE bibles /*\!40100 DEFAULT CHARACTER SET utf8 */;"
mysql -e "GRANT ALL PRIVILEGES ON bibles.* TO '$UNAME';"
mysql -e "FLUSH PRIVILEGES;"

cd /opt/majakkaportaali/utilities/bible/
python3 getbibledata.py 
