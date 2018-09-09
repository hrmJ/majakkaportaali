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
     * Hakee kaikki käytössä olevat kolehtikohteeet ja palauttaa listan niistä
     *
     */
    public function GetListOfOfferingTargets(){
        $targets = $this->con->select("offering_targets", ["id","name","description"]);
        return $targets;
    }


    /**
     *
     * Hakee nykyisen rahatilanteen jostakin tietystä kolehtitavoitteesta
     *
     * @param $goal_id kolehtitavoitteen id
     *
     */
    public function GetCurrentBalanceForOfferingGoal($goal_id){
        $goal = $this->con->get("offering_goals", "amount", ["id" => $goal_id]);
        $current = $this->con->sum("collected_offerings", "amount", ["target_id" => $goal_id]);
        if(!$current){
            $current = 0;
        }
        return ["current" => $current, "goal" => $goal];
    }

    /**
     *
     * Hakee ko. messun kolehtikohteen tai käyttää oletusta
     *
     * @param $service_id messun id
     *
     */
    public function GetCurrentOfferingGoal($service_id){
        $goal =  $this->con->get("collected_offerings",
            ["amount","target_id"], ["service_id" => $service_id]);
        return $goal;
    }


    /**
     *
     * Hakee kaikki käytössä olevat kolehtikohteeet ja kuhunkin liittyvät kaikki tavoitteet
     *
     */
    public function GetListOfOfferingTargetsAndGoals(){
        $targets = $this->GetListOfOfferingTargets();
        $return_vals = [];
        foreach($targets as $target){
            $goals = $this->con->select("offering_goals",
                ["id","name","description","amount"],
                ["target_id" => $target["id"]]
            );
            $return_vals[] = ["target"=> $target, "goals" => $goals];
        }
        return $return_vals;
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
        //TODO: tietokannasta
        return [
            "Messun aihe", "Messun päivämäärä", 
            "Kolehtitilanne", "Kolehtikohteen nimi",  "Kolehtikohteen kuvaus",
            "Kolehtitavoitteen nimi", "Kolehtitavoitteen kuvaus" 
        ];
    }


    /**
     *
     * Tallentaa uuden pienryhmän
     *
     * @param $params tauluun syötettävät arvot (associative array)
     *
     */
    public function SaveNewSmallgroup($params){
        $this->con->insert("smallgroups", $params);
    }


    /**
     *
     * Tallentaa uuden vastuun
     *
     * @param $responsibility vastuun nimi
     *
     */
    public function SaveNewResponsibility($responsibility, $description){
        $service_ids = $this->con->query("SELECT DISTINCT id FROM services")
            ->fetchAll(PDO::FETCH_COLUMN);
        $this->con->insert("responsibilities_meta", ["responsibility" => $responsibility, 
            "description" => $description]);
        foreach($service_ids as $id){
            $this->con->insert("responsibilities",
                [
                    "service_id" => $id,
                    "responsibility" => $responsibility,
                    "responsible" => "",
                ]
            );
        }
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


    /**
     *
     * Tallentaa uuden kolehtikohteen
     *
     * @param $name kohteen nimi
     * @param $description kohteen kuvaus
     * @return uuden kohteen id
     *
     */
    public function SaveNewOfferingTargets($name, $description){
        $this->con->insert("offering_targets", 
            ["name"=>$name,"description"=>$description]);  
        return $this->con->max("offering_targets","id");
    }


    /**
     *
     * Muokkaa yhtä kolehtikohteen tavoitetta
     *
     * @param $goal_id kolehtitavoitteen id
     * @param $goal_params taulukko tallennettavista parametreista
     *
     */
    public function EditOfferingGoal($goal_id, $goal_params){
        $this->con->update("offering_goals", $goal_params, ["id" => $goal_id]);
    }

    /**
     *
     * Poistaa yhden kolehtitavoitteen
     *
     * @param $goal_id kolehtitavoitteen id
     *
     */
    public function RemoveOfferingGoal($goal_id){
        $this->con->delete("offering_goals", ["id" => $goal_id]);
    }


    /**
     *
     * Poistaa yhden kolehtikohteen
     *
     * @param $target_id kolehtikohteen id
     *
     */
    public function RemoveOfferingTarget($target_id){
        $this->con->delete("offering_targets", ["id" => $target_id]);
    }

    /**
     *
     * Tallentaa kolehtikohteeseen tavoitteita
     *
     * @param $id kohteen id
     * @param $goals taulukko tallennettavista tavoitteista
     *
     */
    public function SaveOfferingGoals($id, $goals){
        foreach($goals as $goal){
            $goal_id = $this->con->select("offering_goals",["id"],["name" => $goal["name"]]);
            $params = [
                        "name" => $goal["name"],
                        "amount" => $goal["amount"],
                        "description" => $goal["description"],
                        "target_id" => $id,
                      ];
            if($existing_data){
                $this->con->update("offering_goals", $params, ["id" => $goal_id]);
            }
            else{
                $this->con->insert("offering_goals", $params);
            }
        }
    }

}



?>
