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
     * @param string $return palautetaanko rivien taulukko (oletus), rivi(row), vai yhden rivin yksi sarake
     *
     */
    public function Select($query, $params=Array(),$return="all"){
        //$columns: array, $wheredict: array of arrays, with [0] as column name, [1] as =, not, LIke etc, [2] as the value
        
        $this->query = $this->connection->prepare($query);

        foreach($params as $key => $val){
             $this->query->bindValue($key, $val);
        }

        $this->Run();

        switch($return){
            case "all":
                return $this->query->fetchAll();
                break;
            case "row":
                return $this->query->fetch();
                break;
            case "column":
                return $this->query->fetch()[0];
                break;
        }
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


