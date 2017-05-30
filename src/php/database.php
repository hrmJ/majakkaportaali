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

    /**
     *
     * Suorittaa select-kyselyn
     *
     * @param string $query kysely
     * @param array $params key-value-pareista koostuva taulukko sidottavista arvoista. Voi olla tyhjä.
     *
     */
    public function ArraySelect($query, $params=Array()){
        //$columns: array, $wheredict: array of arrays, with [0] as column name, [1] as =, not, LIke etc, [2] as the value
        if(sizeof($params)>0){
        
        }
        else{
        }
        $this->query = $this->connection->prepare($query);
        $this->Run();

        return $this->query->fetchAll();
    }

    /**
     *
     * Suorittaa kyselyn ja kaappaa tarvittaessa virheen.
     *
     */
    public function Run(){
        try{
            $this->query->execute();
        }
        catch(Exception $e) {
            echo 'Virhe kyselyssä: \n' . $e;
        }
    }


}



?>

