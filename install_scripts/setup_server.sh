# Copy the sample setup for nginx
cp nginx_sample_setup /etc/nginx/sites-enabled/majakkaportaali.test

#(Re)start nginx and php
service ngingx start
service php7.2-fpm start

