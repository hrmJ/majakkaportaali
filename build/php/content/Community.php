<?php
/**
 *
 * Yhtä portaalia käyttävää yhteisöä koskevat tiedot
 *
 */


namespace Portal\content;

use Medoo\Medoo;
use Portal\utilities;
use PDO;


/**
 *
 * 
 * 
 * Yksi portaalia käyttävä yhteisö
 * 
 *
 */
class Community{

    /**
     *
     * @param Medoo $con tietokantayhteys
     *
     */
    protected $con;

    /*
     *
     *
     */
    public function __construct(\Medoo\Medoo $con){
        $this->con = $con;
    }

    /**
     *
     * Hakee kaikki käytössä olevat vastuutyypit ja palauttaa listan niistä
     *
     */
    public function GetListOfResponsibilities(){
        $available_responsibilities = $this->con->query("SELECT DISTINCT responsibility FROM responsibilities")
            ->fetchAll(PDO::FETCH_COLUMN);
        return $available_responsibilities;
    }



    /**
     *
     * Poistaa messun id:n perusteella
     *
     * @param service_id poistettavan messun id
     *
     */
    public function RemoveService($service_id){
        $this->con->delete("services", ["id" => $service_id]);
    }



    /**
     *
     * Hakee yhtä tiettyä vastuuta koskevan metadatan
     *
     */
    public function RemoveResponsibility($responsibility){
        $this->con->delete("responsibilities_meta", ["responsibility" => $responsibility]);
        $this->con->delete("responsibilities", ["responsibility" => $responsibility]);
    }



    /**
     *
     * Hakee yhtä tiettyä vastuuta koskevan metadatan
     *
     */
    public function GetResponsibilityMeta($responsibility){
        return $this->con->get("responsibilities_meta", ["description"], 
            ["responsibility" => $responsibility]);
    }




    /**
     *
     * Hakee kaikki tietokantaan listatut kaudet
     *
     */
    public function GetListOfSeasons(){
        $data = [];
        $seasons = $this->con->select("seasons",
            ["id","name", "startdate", "enddate","theme","comments"]);
        $df = new utilities\DateFormatter();
        foreach($seasons as $idx => $entry){
            $formatted = $entry;
            $formatted["startdate"] = $df
                ->SetDate($entry["startdate"])
                ->FormatDate();
            $formatted["enddate"] = $df
                ->SetDate($entry["enddate"])
                ->FormatDate();
            $data[] = $formatted;
        }
        return $data;
    }


    /**
     * Hakee muita metatietoja
     */
    public function GetListOfServiceMeta(){
        return ["Messun aihe","Messun päivämäärä"];
    }

    /**
     *
     * Tallentaa uudet messut
     *
     * @param $dates taulukko uusista päivämääristä
     *
     */
    public function SaveNewServices($dates){
        foreach($dates as $date){
            $this->con->insert("services",
                ["servicedate" => $date, "theme" => "Aihe puuttuu"]
            );
        }
    }

    /**
     *
     * Tallentaa muokatut kaudet
     *
     * @param $dates taulukko uusista päivämääristä
     *
     */
    public function SaveSeason($newvals, $season_id){
        $this->con->update("seasons", $newvals, ["id" => $season_id]);  
    }


}



?>
