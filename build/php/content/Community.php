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
     * Poistaa messukauden id:n perusteella
     *
     * @param season_id poistettavan kauden id
     *
     */
    public function RemoveSeason($season_id){
        $this->con->delete("seasons", ["id" => $season_id]);
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
     * @param $format muotoillaanko suomalaiseen muotoon
     *
     */
    public function GetListOfSeasons($format=true){
        $data = [];
        $seasons = $this->con->select("seasons",
            ["id","name", "startdate", "enddate","theme","comments"],
                ['ORDER' => [ 'enddate' => 'ASC' ]]);
        $df = new utilities\DateFormatter();
        foreach($seasons as $idx => $entry){
            $formatted = $entry;
            if($format){
                $formatted["startdate"] = $df
                    ->SetDate($entry["startdate"])
                    ->FormatDate();
                $formatted["enddate"] = $df
                    ->SetDate($entry["enddate"])
                    ->FormatDate();
            }
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
        $responsibilities = $this->GetListOfResponsibilities();
        foreach($dates as $date){
            $this->con->insert("services",
                ["servicedate" => $date, "theme" => "Aihe puuttuu"]
            );
            $id = $this->con->max("services","id");
            var_dump($id);
            //Syötetään myös vastuut
            foreach($responsibilities as $responsibility){
                $this->con->insert("responsibilities",
                    ["responsibility" => $responsibility, 
                    "responsible" => "", 
                    "service_id" => $id
                    ]
                );
            }
        }
    }

    /**
     *
     * Tallentaa muokatut kaudet tai lisää uuden
     *
     * @param $dates taulukko uusista päivämääristä
     *
     */
    public function SaveSeason($newvals, $season_id){
        var_dump($season_id);
        var_dump($newvals);
        if($season_id){
            $this->con->update("seasons", $newvals, ["id" => $season_id]);  
        }
        else{
            $this->con->insert("seasons", $newvals);  
        }
    }

    /**
     *
     * Hakee nykyistä päivämäärää lähimmän messukauden
     *
     * @param $current_date päivämäärä muodosso yyyy-mm-dd
     *
     */
    public function GetCurrentSeason($current_date){
        $seasons = $this->con->select("seasons", 
            ["name","startdate","enddate","id"],
            [ "AND" => [
                "startdate[<=]" =>  $current_date,
                "enddate[>=]" =>  $current_date,
                ]
            ]
        );
        if(!$seasons){
            //Jos ei osu mihinkään kauteen, yritä ekaa tulevaisuudesta
            $seasons = $this->con->select("seasons", 
                ["name","startdate","enddate","id"],
                [ 
                    "startdate[>=]" =>  $current_date,
                    'ORDER' => [ 'startdate' => 'ASC' ]
                ]
            );
        }
        if(!$seasons){
            //Jos ei osu mihinkään kauteen, yritä vikaa menneisyydestä
            $seasons = $this->con->select("seasons", 
                ["name","startdate","enddate","id"],
                [ 
                    "enddate[<=]" =>  $current_date,
                    'ORDER' => [ 'enddate' => 'DESC' ]
                ]
            );
        }
        return $seasons[0];
    }

}



?>
