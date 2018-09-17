<?php

namespace Portal\content;

use Medoo\Medoo;
use PDO;
use Portal\utilities;


/**
 *
 * Yhden messukauden kaikki messut
 *
 */
class Servicelist{

    /**
     *
     * @param Medoo $con tietokantayhteys
     *
     */
    protected $con;
    public $season;

    /*
     *
     *
     */
    public function __construct(\Medoo\Medoo $con){
        $this->con = $con;
    }


    /**
     *
     * Listaa kaikki nykyisen kauden messut, niiden teemat ja päivämäärät
     *
     */
    public function ListServices(){
        $dates_and_themes = $this->con->select("services",
            ["servicedate", "theme", "id"],
            [
                "AND" => [
                    "servicedate[>=]" => $this->season["startdate"],
                    "servicedate[<=]" => $this->season["enddate"],
                ],

                "ORDER" =>  ["servicedate" => "ASC"] 
            ]
            );
        return $this->FormatDates($dates_and_themes);
    }

    /**
     *
     * Muotoile päivämäärät
     *
     *
     * @param $data muokattava taulukko, jonka joka solussa yksi 'servicedate'-key
     *
     */
    public function FormatDates($data){
        $df = new utilities\DateFormatter();
        foreach($data as $idx => $entry){
            $data[$idx]["servicedate"] = $df
                ->SetDate($entry["servicedate"])
                ->FormatDate();
        }
        return $data;
    }

    /**
     *
     * Listaa tietyt vastuut kaikista nykyisen kauden messuista
     *
     * @param $filteredby minkä mukaan suodatetaan
     *
     */
    public function ListServicesFilteredBy($filteredby){

        $data = $this->con->query("SELECT res_tab.responsible, 
                        ser_tab.servicedate, ser_tab.id  as service_id
                FROM responsibilities res_tab  LEFT JOIN 
                services ser_tab ON res_tab.service_id = ser_tab.id 
                WHERE res_tab.responsibility = :filteredby AND
                (ser_tab.servicedate >= :sd AND ser_tab.servicedate <= :ed) 
                ",
                 ["filteredby" => $filteredby ,
                 "sd" => $this->season["startdate"],
                 "ed" => $this->season["enddate"]
                 ])->fetchAll();

        return $this->FormatDates($data);

    }


    /**
     *
     * Tallenna kaikki messulistan tietyn vastuun vastuulliset kerralla
     *
     * @param $data päivitettävät tietokannan rivit taulukkona
     *
     */
    public function BulkSaveResponsibilities($data){

        foreach($data as $row){
            $this->con->update("responsibilities",
                ["responsible" => $row["responsible"]],
                [
                    "service_id" => $row["service_id"],
                    "responsibility" => $row["responsibility"]
                ]
            );
        }

    }


    /**
     *
     * Tallenna kaikki messulistan tietyn vastuun vastuulliset kerralla
     *
     * @param $data päivitettävät tietokannan rivit taulukkona
     *
     */
    public function SaveEditedResponsibility($data){
        $this->con->update("responsibilities",
            [
                "responsibility" => $data["new_responsibility"]
            ],
            ["responsibility" => $data["old_responsibility"]]
        );
        $this->con->delete("responsibilities_meta",
            ["responsibility" => $data["old_responsibility"]]);
        $this->con->insert("responsibilities_meta",
            [
                "responsibility" => $data["new_responsibility"],
                "description" => $data["description"]
            ] );
    }


    /**
     *
     * Märittää nykyisen messukauden rajat
     *
     * @param string $startdate aikaisin päivämäärä muotoa yyyy-mm-dd
     * @param string $enddate myöhäisin päivämäärä muotoa yyyy-mm-dd
     *
     */
    public function SetSeason($startdate, $enddate){
        $this->season = ["startdate" => $startdate, "enddate" => $enddate];
        return  $this;
    }

    /**
     *
     * Hae nykyistä päivää lähin messu
     *
     */
    public function GetNextService(){
        $date = date('Y-m-d');
        //Kokeile ensin tätä päivää
        $next_id = $this->con->get("services", "id", 
            [
                "servicedate[>=]" => $date,
                "ORDER" => ["servicedate" => "ASC"]
            ]);
        if(!$next_id){
            return "no next services";
        }
        else{
            return $next_id;
        }
    }

}



?>
