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
        $df = new utilities\DateFormatter();
        $dates_and_themes = $this->con->select("services",
            ["servicedate", "theme", "id"],
            ["AND" => [
                "servicedate[>=]" => $this->season["startdate"],
                "servicedate[<=]" => $this->season["enddate"]]],
            ["ORDER" => [
                ["servicedate" => "ASC"]
            ]]);
        foreach($dates_and_themes as $idx => $entry){
            $dates_and_themes[$idx]["servicedate"] = $df
                ->SetDate($entry["servicedate"])
                ->FormatDate();
        }
        return $dates_and_themes;
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
