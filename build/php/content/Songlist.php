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
    public function __construct(\Medoo\Medoo $con, $id, $m=null){
        $this->con = $con;
        $this->id = $id;
        if($m){
            $this->template_engine = $m;
        }
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
        $titles = $this->con->select("songdata",
             ["title" =>  Medoo::raw('DISTINCT(title)')],
             ["OR" => [
                "title[~]" => strtolower("%$title%"),
                "title[~]" => strtoupper("%$title%")
            ]]);
        $returns = [];
        foreach($titles as $title){
            $returns[] =  $title["title"];
        }
        return $returns;
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
        $res =  $this->con->select("songdata", "id", 
            [
                "title[!]" => "",
                "OR" =>
                    [
                        "title" => strtolower("$title"),
                        "title" => strtoupper("$title")
                    ]
            ]
        );

        return $res;
    }

    /**
     *
     * Hakee kaikki laulut, jotka alkavat tietyllä kirjaimella
     *
     * @param string $letter kirjain, jolla etsitään
     *
     * @return lista kirjaimista
     *
     */
    public function GetTitlesByLetter($letter){
        $songs = $this->con->select("songdata",
            ["title" =>  Medoo::raw('DISTINCT(title)')],
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
    public function LoadSongSlots($service_id){
        $cols = ["slot_name", "content_id", "slot_number"];
        $slots = $this->con->select("service_specific_presentation_structure",
            $cols,
            [
                "slot_type" => "songsegment", 
                "service_id" => $service_id,
                'ORDER' => [ 'slot_number' => 'ASC' ]
            ]);
        if(!$slots){
            $slots = $this->con->select("presentation_structure",
                $cols, [
                    "slot_type" => "songsegment",
                    'ORDER' => [ 'slot_number' => 'ASC' ]
                ]);
        }

        $this->slots_as_string = "";
        foreach($slots as $slot){
            $slot_specification = $this->con->get("songsegments",
                ["songdescription", "is_multi"],
                ["id" => $slot["content_id"]]
            );
            $output = $this->template_engine->loadTemplate('singlesong'); 
            $this->slots_as_string  .= "\n" . $output->render([
                    "category" => $slot["slot_name"],
                    "name" => "",
                    "value" => "",
                    "is_multi" => $slot_specification["is_multi"],
                    "songdescription" => $slot_specification["songdescription"],
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
            ["song_title","song_id"],
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
     * Hakee laulun sanat sen id:n perusteella
     *
     * @param $id laulun id
     * @param $simplify palautetaanko yksinkertaistettu taulukko
     *
     */
    public function FetchLyricsById($id,$simplify=false){
        $text = $this->con->select("versedata",
            "verse",
            ["song_id" => $id],
            ["ORDER" => "id"]);
        if($simplify){
            $newtext = [];
            foreach($text as $verse){
                $newtext[] = $verse["verse"];
            }
            $text = $newtext;
        }
        return($text);
    }


    /**
     *
     * Lisää uudet laulun sanat: joko kokonaan uuden laulun tai uuden version
     *
     * @param $title laulun nimi
     * @param $verses taulukko säkeistöistä
     *
     */
    public function AddLyrics($title, $verses){
        $this->con->insert("songdata", [
            "title" => $title
        ]);
        $id = $this->con->max("songdata","id");
        foreach($verses as $verse){
            $this->con->insert("versedata", [
                "song_id" => $id,
                "verse" => $verse
            ]);
        }
        //multisong_position?
    }

    /**
     *
     * Tallentaa muokatut laulun sanat sen id:n perusteella
     *
     * @param $id laulun id
     * @param $verses taulukko säkeistöistä
     *
     */
    public function SaveEditedLyrics($id, $verses){
        $this->con->delete("versedata", ["song_id" => $id]);
        foreach($verses as $verse){
            $this->con->insert("versedata", [
                "song_id" => $id,
                "verse" => $verse
            ]);
        }
        //multisong_position?
    }


}



?>
