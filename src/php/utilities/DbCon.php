<?php

namespace Portal\utilities;
use PDO;


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
     * @param boolean $connect yhdistetäänkö heti vai ei 
     *
     **/
    public function __construct ($path, $connect=True) {

        $config = parse_ini_file($path);
        $this->hostname = $config["hostname"];
        $this->dbname = $config["dbname"];
        $this->username = $config["un"];
        $this->password = $config["pw"];
        if($connect)
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
     * Suorittaa mysql-kyselyn
     *
     * @param string $query kysely
     * @param array $params key-value-pareista koostuva taulukko sidottavista arvoista. Voi olla tyhjä.
     * @param string $return palautetaanko rivien taulukko (oletus), rivi(row), vai yhden rivin yksi sarake
     *
     */
    public function q($query, $params=Array(),$return="all"){
        //$columns: array, $wheredict: array of arrays, with [0] as column name, [1] as =, not, LIke etc, [2] as the value
        
        $this->query = $this->connection->prepare($query);

        foreach($params as $key => $val){
            #1-based numbers, so increment by in
            if(is_numeric($key))
                $key++;
             $this->query->bindValue($key, $val);
        }

        $this->Run();

        switch($return){
            case "all_flat":
                $results =  $this->query->fetchAll();
                $returnvals = Array();
                foreach($results as $result){
                    $returnvals[] = $result[0];
                }
                return $returnvals;
                break;
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


    /**
     *
     * Tallentaa käyttäjän tekemät muutokset joko messulistaan, yksittäiseen messuun
     * tai laulujen listaan riippuen siitä, mikä DbCon-luokan alalauokka kyseessä.
     *
     * @param array values Arvot, joita syötetään tietokantaan
     * @param string/integer identifier messun id tai vastuun nimi, jonka perusteella päivitys tehdään
     *
     */
    public function SaveData($identifier, $values){
        foreach($values as $valuekey => $item){
            switch($this->type){
                case "details":
                    $this->q("UPDATE responsibilities SET responsible = :responsible WHERE service_id = :id AND responsibility = :responsibility",Array("id"=>$identifier,"responsible"=>$item,"responsibility"=>$valuekey),"none");
                    break;
                case "list":
                    $this->q("UPDATE responsibilities SET responsible = :responsible WHERE service_id = :id AND responsibility = :responsibility",Array("id"=>str_replace("id_","",$valuekey),"responsible"=>$item,"responsibility"=>$identifier),"none");
                    break;
            }
        }
    }

}

/**
 *
 * Yhteys tietokantaan messujen listasta käsin
 *
 * @param string $type Yhteyden tyyppi
 *
 */
class ServiceListCon extends DbCon{
    protected $type = "list";
}

/**
 *
 * Yhteys tietokantaan yksittäisestä messunäkymästä käsin
 *
 * @param string $type Yhteyden tyyppi
 *
 */
class ServiceDetailsCon extends DbCon{
    protected $type = "details";
}

/**
 *
 * Yhteys tietokantaan laulujen listasta käsin
 *
 * @param string $type Yhteyden tyyppi
 * @param Array $multisongs_inserted taulukko, jolla seurataan, minkä verran ehtoollis-/ylistyslauluja syötetty
 *
 */
class SongCon extends DbCon{
    protected $type = "song";
    protected $multisongs_inserted = Array("ws"=>0,"com"=>0);
}

?>


