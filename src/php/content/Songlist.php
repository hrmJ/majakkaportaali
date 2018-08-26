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
     * Hakee kaikki laulut / säveltäjät / sanoittajat, jotka alkavat tietyllä kirjaimella
     *
     * @param $type mitä etsitään ('title', 'lyrics', jne.)
     * @param $search_this etsittävä merkkijono
     *
     * @return lista kirjaimista
     *
     **/
    public function GetAutoCompleteData($type, $search_this){
        $vals = $this->con->select("songdata",
             [$type =>  Medoo::raw("DISTINCT($type)")],
             ["OR" => [
                $type. "[~]" => strtolower("%$search_this%"),
                $type. "[~]" => strtoupper("%$search_this%")
            ]]);
        $returns = [];
        foreach($vals as $val){
            $returns[] =  $val[$type];
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
     * @param $title jos määritetty, haetaan nimen eikä id:n perusteella
     *
     */
    public function FetchLyricsById($id=Null,$simplify=false, $title=""){
        if($title != ""){
            $id = $this->con->get("songdata","id",["title" => $title]);
        }
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
     * Hakee lauluun liittyvät metatiedot
     *
     * @param $id laulun id
     *
     */
    public function LoadSongMeta($id){
        $meta = $this->con->get("songdata",
            ["composer","lyrics"],
            ["id" => $id]);
        $meta["tags"] = $this->LoadSongTags($id, true);
        return($meta);
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
    }


    /**
     *
     * Hakee tietokannasta kaikki eri tägit
     *
     * @param $song_id haettavan laulun id
     * @param $only_existing haetaanko vain tietystä laulusta
     *
     */
    public function LoadSongTags($song_id=null, $only_existing=False){
        if($song_id){
            $tags = $this->con->select("songtags",
                 ["tag" =>  Medoo::raw('DISTINCT(tag)')],
                 ["song_id" => $song_id]);
        }
        else if(!$only_existing){
            $tags = $this->con->select("songtags",
                 ["tag" =>  Medoo::raw('DISTINCT(tag)')]);
        }
        $returns = [];
        foreach($tags as $tag){
            $returns[] =  $tag["tag"];
        }
        return $returns;
    }


    /**
     *
     * Tallentaa muokatut tägit
     *
     * @param $id laulun id
     * @param $verses taulukko tägeistä (?)
     *
     */
    public function SaveEditedTags($id, $tags){
        $this->con->delete("songtags", ["song_id" => $id]);
        $used = [];
        foreach($tags as $tag){
            if(!in_array($tag, $used)){
                $this->con->insert("songtags", [
                    "song_id" => $id,
                    "tag" => $tag
                ]);
                $used[] = $tag;
            }
        }
    }



    /**
     *
     * Tallentaa muokatut säveltäjä-/sanoittajatiedot
     *
     * @param $id laulun id
     * @param $authortype joko 'lyrics' tai 'composer'
     * @param $newval kentän uusi arvo
     *
     */
    public function SaveEditedAuthors($id, $authortype, $newval){
        $this->con->update("songdata", 
            [$authortype => $newval],
            ["id" => $id]);
    }

}



?>
