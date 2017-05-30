<?php

/**
 *
 * Hallitsee yhteyksiä tietokantaan.
 *
 *
 **/
class DbCon{

    /**
     * Tietokannan perustiedot
     *
     * @param string $path polku ini-tiedostoon
     *
     **/
    public function __construct ($path) {

        $config = parse_ini_file($path);
        $this->hostname = $config["hostname"];
        $this->dbname = $config["dbname"];
        $this->username = $config["un"];
        $this->password = $config["pw"];
        $this->Connect();

    }

    /**
     * Yhdistä tietokantaan
     *
     **/
    public function Connect(){
        $this->connection = new PDO("mysql:host=$this->hostname;dbname=$this->dbname;charset=utf8", $this->username, $this->password);
        // set the error mode to exceptions
        $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        //mysql_set_charset('utf8', $this->connection);  
    }


}



?>
