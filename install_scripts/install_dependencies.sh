#!/bin/bash
# Asentaa majakkaportaalin tarvitsemat riippuvuudet. Oletuksena ubuntu 18.04.

# Install ngninx mysql, php, node, composer, ruby (for sass) and some additional php packages
apt install -y nginx mysql-server-5.7 mysql-client-5.7 php7.2-fpm php7.2-mysql php7.2-mbstring php7.2-xml nodejs npm composer phpunit ruby2.5 ruby2.5-dev wget python3-sqlalchemy python3-pymysql

# Install sass from ruby
gem install sass

# CD to the directory of the project and install php dependencies + node dependencies
# TODO: not as root
cd /opt/majakkaportaali
npm install gulp-cli -g
npm install --save-dev

