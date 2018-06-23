<?php
/**
 *
 * Yhden messun laulut ja niiden syöttäminen
 *
 */


namespace Portal\content;

use Medoo\Medoo;
use PDO;


/**
 *
 * Messussa käytössä olevat laulut 
 * Tai listat mahdollisista lauluista
 *
 */
class Songlist{

    /**
     *
     * @param Medoo $con tietokantayhteys
     * @param integer $id messun id
     * @param string $slots_as_string kaikki lauluslotit valmiina html:nä
     *
     */
    protected $con;
    public $id;
    public $slots_as_string = "";

    /*
     *
     *
     */
    public function __construct(\Medoo\Medoo $con, $id, $m){
        $this->con = $con;
        $this->id = $id;
        $this->template_engine = $m;
    }


    /**
     *
     * Hakee kaikkien laulujen ensimmäiset kirjaimet
     * aakkosjärjestyksessä
     *
     * @return lista kirjaimista
     *
     **/
    public function GetAlphabets(){
        return $this->con->query(
            "SELECT LEFT(title, 1) as fc FROM songdata 
            GROUP BY fc HAVING fc != '' 
            ORDER BY fc")
            ->fetchAll(PDO::FETCH_COLUMN);
    }


    /**
     *
     * Hakee kaikki laulut, jotka alkavat tietyllä kirjaimella
     *
     * @param string $title 
     *
     * @return lista kirjaimista
     *
     **/
    public function GetTitles($title){
        return $this->con->select("songdata", "title", ["OR" =>
            [
                "title[~]" => strtolower("%$title%"),
                "title[~]" => strtoupper("%$title%")
            ]]);
    }

    /**
     *
     * Tarkistaa, onko jotakin laulua nimellä X tietokannassa
     *
     * @param string $title  nimi, jota ollaan tarkistamassa
     *
     * @return true / false
     *
     **/
    public function CheckTitle($title){
        $res =  $this->con->select("songdata", "title", ["OR" =>
            [
                "title" => strtolower("$title"),
                "title" => strtoupper("$title")
            ]]);

        if(sizeof($res)==1 and $res[0] == ""){
            //Tyhjistä palauta false
            return false;
        }
        //TODO: monta mätsiä nimen perusteella
        return (sizeof($res)>0 ? true : false);
    }

    /**
     *
     * Hakee kaikki laulut, jotka alkavat tietyllä kirjaimella
     *
     * @param string $letter kirjain, jolla etsitään
     *
     * @return lista kirjaimista
     *
     **/
    public function GetTitlesByLetter($letter){
        $songs = $this->con->select("songdata",
            "title",
            ["OR" => 
                [
                "title[~]" => strtolower($letter) . "%",
                "title[~]" => strtoupper($letter) . "%"
                ]
            ],
            ["ORDER" =>
                [ "ACC" => "title"]
            ]
        );
        $returns = [];
        foreach($songs as $song){
            $returns[] = $song["title"];
        }
        return $returns;
    }

    /**
     * Lataa tietokannasta kaikki messussa käytössä olevat laulutyypit
     * (määritelty service_structure.php-sivulla) ja syötä sivupohjaan
     * niiden mukaiset slotit lauluille.
     *
     */
    public function LoadSongSlots(){
        //Hae ensin kaikki lauluslotit rakenteesta (TODO: messukohtaisesti)
        $slots = $this->con->select("presentation_structure",
            ["slot_name", "content_id", "slot_number"],
            ["slot_type" => "songsegment"],
            ['ORDER' => [ 'slot_number' => 'ASC' ]]
            );
        $this->slots_as_string = "";
        foreach($slots as $slot){
            $multi = $this->con->get("songsegments","multiname",["id"=>$slot["content_id"]]);
            $output = $this->template_engine->loadTemplate('singlesong'); 
            $this->slots_as_string  .= "\n" . $output->render([
                    "category" => $slot["slot_name"],
                    "name" => "",
                    "value" => "",
                    "isparent" => ($multi ? "multisong" : "")
                ]);
        }
        return $this;
    }

    /**
     * Lataa kaikki yhden "kontin" sisältämät lauluslotit
     *
     * @param segment_name minkä tyypin lauluja haetaan
     *
     */
    public function LoadSlotsToCont($segment_name){
        $slots = $this->con->select("servicesongs",
            ["song_title","multisong_position"],
            [
                "service_id" => $this->id,
                "songtype" => $segment_name
            ],
            ["ORDER" => "multisong_position"]
        );
        //multisong_position?
        return($slots);
    }


    /**
     * Tallentaa yhden "kontin" sisältämien lauluslottien järjestyksen
     *
     * @param segment_name minkä tyypin lauluja haetaan
     *
     */
    public function SaveContOrder($songs){
        $slots = $this->con->select("servicesongs",
            ["song_title","multisong_position"],
            [
                "service_id" => $this->id,
                "songtype" => $segment_name
            ],
            ["ORDER" => "multisong_position"]
        );
        //multisong_position?
        return($slots);
    }

}



?>
