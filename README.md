# Majakkaportaali

Projektin tarkoitus tehdä seurakuntavastuiden jakamisesta ja viestinnästä helpompaa. 

# Yleistietoja

Portaalin data sijaitsee MySQL-tietokannassa, käyttöliittymä on toteutettu
simppeleillä web-tekniikoilla (css, html, php, js).

# Laulut

HUOM! Täytyy painottaa, että tällä hetkellä tunnistus yksinomaan song_title-sarakkeen kautta eikkä id:n!

# Kehitysympäristön pystyttäminen

Tässä perustiedot siitä, miten projektin saa käyntiin.


## Serveriympäristön pystyttäminen

### Vaihtoehto 1 Virtuaalikone

Luodaan virtualbox + vagrant -yhdistelmällä virtuaaliserveri

1. Asenna VirtualBox
2. Asenna vagrant
3. Kloonaa homestead improved (https://github.com/Swader/homestead_improved hi_majakkaportaali)
4. Mene hi_majakkaportaali-kansioon ja  aja sieltä käsin `bin/folderfix.sh`
5. kloonaa tämän kansion sisään majakkaportaali

    git clone https://github.com/hrmJ/majakkaportaali

Tämän jälkeen virtuaalikone pitäisi käynnistää komentamalla homestead-kansiossa `vagrant up`
mutta on mahdollista, että varsinaisen koneen BIOSista on ensin käytävä säätämässä virtuaaliajoa säätelevät
asetukset kohtaan "enabled". Tämän jälkeen kone on oikeasti *sammutettava* (rebuuttaus ei riitä)
ja käynnistettävä uudestaan. Sitten vagrant up -komennon pitäisi toimia.

Tämän jälkeen muokataan hi_majakkaportaali-kansiossa homestead.yaml-tiedostoa,
niin että siinä lukee:

    sites:
        - map: majakkaportaali.app
          to: /home/vagrant/Code/majakkaportaali/build

Vagrant-koneelle voi ssh:oida itsensä komentamalla hi_majakkaportaali-kansion sisältä *vagrant ssh*.

Seuraava askel on lisätä homestead-kone hosts-listaan (linuxissa /etc/hosts):

    192.168.10.10 majakkaportaali.app

Tämän jälkeen aja vielä hi_majakkaportaali-kansiossa vagrant provision, ja
kokeile mennä selaimella osoitteeseen majakkaportaali.app.

## MySql-kirjautuminen virtuaalikoneella


    mysql -u homestead -psecret


### Sensitiivinen tieto ini-tiedostoon

Tallenna sensitiivinen tieto src-kansion ulkopuolelle config.ini-tiedostoon. Tämä
tiedosto pitää myös jättää pois versionhallinnasta lisäämällä se .gitignore-tiedostoon
(näin oletuksena onkin, mutta voit varmuuden vuoksi tarkistaa .gitignore:n sisällön)


    vagrant ssh
    cd Code/majakkaportaali
    vim config.ini

Tiedoston sisältö (ala kirjoittaa painamalla `i`)

    un = homestead
    pw = secret
    dbname = majakkaportaali
    hostname = localhost


Poistu kirjoitustilasta painamalla Esc-näppäintä. Tallenna kirjoittamalla :wq ja painamalla Enter.



Luo testidata tietokantaan:

    php mockdb.php


## Projektin kansiorakenne

Juuri:

- SRC-kansio
- BUILD-kansio

## GULP.js

Asennus järjestelmänlaajuisesti

    npm install gulp-cli -g

Sitten lokaalisti:

    npm install gulp --save-dev

Pluginit:

    npm install gulp-newer --save-dev
    npm install gulp-concat --save-dev
    npm install gulp-deporder --save-dev
    npm install event-stream --save-dev
    npm install --save-dev gulp-ruby-sass
    npm install --save-dev gulp-autoprefixer


## SASS

CSS-koodaus on tehty SASS-esiprosessoria ([](http://sass-lang.com/)) käyttäen.
SASSin voi asentaa ruby-versiona:

    gem install sass

Vaatii tarpeeksi uuden Rubyn (>2.2).

    sudo apt-add-repository ppa:brightbox/ruby-ng
    sudo apt-get update
    sudo apt-get install ruby2.3 ruby2.3-dev


Kun sass on asennettu, sen voi laittaa automaattisesti päivittämään muutokset CSS:ään:

    sass --watch src/sass/:src/stylesheets




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
Myös jquery node-moduulina pitää asentaa.

    npm install nightmare
    npm install mocha
    npm install chai
    npm install jquery


### Phpunit 

Php-testien kanssa alkuun pääsee [phpunitilla](https://phpunit.de/getting-started.html)

HUOM!  Vaatii php:n >= 5.6

Asennus on simppeli, lataa vain paketti, jonka valinnaan mukaan voi kopioida /usr/local/bin-kansioon

    wget https://phar.phpunit.de/phpunit.phar 
    chmod +x phpunit.phar
    sudo mv phpunit.phar /usr/local/bin/phpunit

# Testaaminen

## Javascript (functional tests)

Testaaminen tapahtuu Nightmare-sovelluksen avulla (electronia käyttävä npm-moduuli).

Aja `npm test` projektin juurikansiossa.


## Php (unit tests)

Testaaminen tapahtuu phpunit-sovelluksen avulla.

**Huom!** Aja ennen testejä:

    php mockdb.php

Tämä luo tietokannat (tai poistaa, jos ne on jo olemassa) ja pystyttää
uudelleen syöttäen samalla testidatan.

Jos halutaan tehdä testejä, jotka *olettavat, ettei tietokannassa ole dataa*, lisää
*tähän kyseiseen testiin* osa, joka tyhjentää tarvittavat kohdat tietokannasta. Vaihtoehtoisesti
tämä tarkoituksellinen tyhjennys voi olla oma skriptinsä, joka pitää ajaa ennen tiettyä testiä.

Aja testit (esimerkiksi) komennolla

    phpunit --config=phpunit.xml

Hyödyllinen liipasin: --testdox (Tällä näkee nopeasti, mikä testi feilaa ja mikä menee läpi, joskaan ei sitä, *miksi*)


# Dokumentaation luonti

## Javascript-dokumentaatio 

jsDoc

## Php-dokumentaatio

### Dokumentaatiotyökalun (phpdoc) asennus

1. Lataa phpdoc phar-tiedostona osoitteesta https://phpdoc.org/

    wget http://phpdoc.org/phpDocumentor.phar
    chmod +x phpDocumentor.phar
    sudo mv phpDocumentor.phar /usr/local/bin/phpdoc

2. Luo dokumentaatio ajamalla:

    phpdoc -d ./src/ -t docs/php --template="zend"

(varmista tarpeeksi korkea php-versio)

## SQL-taulujen luonti

ks. sql/taulut.sql

## Testikäyttäjän lisääminen

auth/create_user.php

# Muuta

src-kansiossa myös get_hymn.py-pythonksripti, jolla voi ladata virsien sanoja tekstimuodossa
evlfi-sivuilta.
