# Majakkaportaali

Projektin tarkoitus tehdä seurakuntavastuiden jakamisesta ja viestinnästä helpompaa. 

# Yleistietoja

Portaalin data sijaitsee MySQL-tietokannassa, käyttöliittymä on toteutettu
simppeleillä web-tekniikoilla (css, html, php, js).

# Kehitysympäristön pystyttäminen

Tässä perustiedot siitä, miten projektin saa käyntiin.

## Projektikansio localhostille

Kannattaa kloonata projektikansio jonnekin aivan muualle ja luoda symbolinen linkki
silla /var/www/html/-kansioon.

    cd /var/www/html/
    ln -s ~/projects/majakkaportaali/src majakkaportaali #Huom: linkkaa nimenomaan src-kansio

##  Testityökalut

Perusideologiana projektin kehittämisessä on testata koodia mahdollisimman tehokkaasti.
Tämän toteuttamiseksi voidaan käyttää seuraavia työkaluja.

### Node js

Asennus esim. Ubuntussa:

    apt-get install nodejs npm node

Node pitää mahdollisesti päivittää uusimpaan versioon:

    sudo npm cache clean -f
    sudo npm install -g n
    sudo n stable

### Nightmare + mocha

Selainpohjainen testaus on toteutettu Nightmare + mocha + chai -yhdistelmällä

    npm install nightmare
    npm install mocha


### Phpunit 

Php-testien kanssa alkuun pääsee [phpunitilla](https://phpunit.de/getting-started.html)

HUOM!  Vaatii php:n >= 5.6

Asennus on simppeli, lataa vain paketti, jonka valinnaan mukaan voi kopioida /usr/local/bin-kansioon

    wget https://phar.phpunit.de/phpunit.phar 
    chmod +x phpunit.phar
    sudo mv phpunit.phar /usr/local/bin/phpunit

# Testaaminen

## Nightmare (functional tests)

Aja `npm test` projektin juurikansiossa.


## Phpunit (unit tests)

Aja testit (esimerkiksi) komennolla

    phpunit --bootstrap src/php/templating.php --testdox tests/IndexTest


# Dokumentaation luonti

## Javascript-dokumentaatio 

jsDoc

## Php-dokumentaatio

### Dokumentaatiotyökalun (phpdoc) asennus

1. Lataa phpdoc phar-tiedostona osoitteesta https://phpdoc.org/
2. Luo dokumentaatio ajamalla:

    php phpDocumentor.phar -d ./src/ -t docs/php

(varmista tarpeeksi korkea php-versio)

## SQL-taulujen luonti

ks. sql/taulut.sql

## Testikäyttäjän lisääminen

auth/create_user.php

# HUOM!

Tällä hetkellä diojen luonti palvelimella on siirtymävaiheessa, niin että 
esitystekniikka on toteutettu symlinkkeinä htmlslides-Projektin kansiosta 
(ks. pres-kansio tässä projektissa).
