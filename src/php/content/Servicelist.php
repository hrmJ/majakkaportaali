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
            ["AND" => [
                "servicedate[>=]" => $this->season["startdate"],
                "servicedate[<=]" => $this->season["enddate"]]],
            ["ORDER" => [
                ["servicedate" => "ASC"]
            ]]);
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

        $data = $this->con->query("SELECT res_tab.responsible, ser_tab.servicedate FROM 
                responsibilities res_tab  LEFT JOIN 
                services ser_tab ON res_tab.service_id = ser_tab.id 
                WHERE res_tab.responsibility = :filteredby",
                ["filteredby" => $filteredby])->fetchAll();
        return $this->FormatDates($data);

    }

    /**
     *
     * Valitsee sen messukauden, joka on lähinnä nykyistä päivämäärää.
     * Yrittää ensin löytää kauden, jonka sisälle nykyinen päivä osuu.
     * Tämän jälkeen yrittää hakea ensimmäisen kauden tulevaisuudesta.
     * Jos tämäkin epäonnistuu, hakee lähimmän kauden menneisyydestä.
     *
     * @param string $switch vaihdetaanko edelliseen (prev) tai seuraavaan (next)
     *
     */
    public function SetSeason($switch="no"){
        $columns = ["id", "name", "startdate", "enddate"];
        $date = date('Y-m-d');
        $this->season = $this->con->get("seasons", $columns,
            ["AND" => [
                "startdate[<=]" => $date,
                "enddate[>=]" => $date]],
            [ "ORDER" =>[ "startdate" => "ASC"]]);
        #Jos nykyinen pvm ei osu mihinkään kauteen
        if(!$this->season) {
            #1: ota seuraava kausi tulevaisuudesta
            $this->season = $this->con->get("seasons", $columns,
                ["startdate[>=]" => $date],
                [ "ORDER" =>["startdate" => "ASC"]]);
        }
        if(!$this->season) {
            #2: ota edellinen kausi menneisyydestä
            $this->season = $this->con->get("seasons", $columns,
                ["enddate[<=]" => $date],
                [ "ORDER" =>["enddate" => "DESC"]]);
        }
        return  $this;
    }

}



?>
