# Majakkaportaali

Projektin tarkoitus tehdä seurakuntavastuiden jakamisesta ja viestinnästä helpompaa. 

# Asennus LXC-konttiin

Kloonaa ensin majakkaportaali-repositorio sopivaan sijaintiin host-koneella.
(esimerkiksi `~/projects/majakkaportaali`).

(`git clone https://github.com/hrmJ/majakkaportaali.git`).


## Kontin luominen

Ohjeet olettavat, että käytössä on [lxc-kontteja](https://linuxcontainers.org/).
tukeva linux-distro. Oletusympäristö kehitystyöhön itse kontissa on ubuntu 18.04.

1. Luo ubuntu 18.04 -kontti: `sudo lxc-create -t download -n majakkaportaali`
    - Vastaa kysymyksiin distrosta, versiosta and arkkitehtuurista: ubuntu, bionic, amd64

2. Käynnistä kontti: `sudo lxc-start -n majakkaportaali`. 
   Kirjaudu sisään: `sudo lxc-attach -n majakkaportaali`.

3. Luo kontissa kansio projektia varten, esim. `mkdir /opt/majakkaportaali`

4. Kirjaudu ulos (aja isäntäkoneella `sudo lxc-stop -n majakkaportaali`)

5. Kehitystyön helpottamiseksi mounttaa projektikansio konttiin. Aja
   isäntäkoneella:

```
sudo echo 'lxc.mount.entry = {KOKO POLKU majakkaportaali-kansioon} /var/lib/lxc/nexthammer/rootfs/opt/nexthammer/  none bind 0 0' >> /var/lib/lxc/nexthammer/config
```

Esimerkiksi siis:

```
sudo echo 'lxc.mount.entry = /home/user/projects/majakkaportaali /var/lib/lxc/nexthammer/rootfs/opt/nexthammer/  none bind 0 0' >> /var/lib/lxc/nexthammer/config
```

Starttaa sitten kontti uudestaan ja kirjaudu uudestaan sisään:
```
sudo lxc-start -n majakkaportaali
sudo lxc-attach -n majakkaportaali
```


## Portaalin asennus kontissa

Kun kontti on luotu, siirry `/opt/majakkaportaali/install_scripts`-kansioon.
Aja siellä skriptit seuraavassa järjestyksessä

```

cd install_scripts/
sh install_dependencies.sh
sh setup_mysql.sh
sh setup_server.sh

```

## Portaaliin pääsy isäntäkoneelta


1. Ota  talteen kontin ip-osoite ajamalla `sudo lxc-info -n majakkaportaali`
2. Muokkaa `/etc/hosts` -tiedostoa tunnistamaan tämä ip (esim `sudo vim /etc/hosts`) lisäämällä
rivi: `{IP-OSOITE} majakkaportaali.test`.


Nyt majakkaportaalin pitäisi näkyä, kun menet isäntäkoneella osoitteeksi esimerkiksi
`majakkaportaali.test/service?id=2`

Jos sivua ei näy, tsekkaa nginx-logi (`/var/log/nginx/majakkaportaali.test-error.log`)
