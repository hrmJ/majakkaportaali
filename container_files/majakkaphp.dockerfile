FROM phpdockerio/php74-fpm
#RUN apt-get update && apt-get install -y php7.3-pdo_mysql \
#&& rm -rf /var/lib/apt/lists/*
RUN phpenmod pdo
