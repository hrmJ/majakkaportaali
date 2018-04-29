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
            ["slot_name", "content_id"],
            ["slot_type" => "songsegment"],
            ["ORDER" => ["slot_number" => "ASC"]]);
        foreach($slots as $slot){
            //Hae jokaisen lauluslotin tarkemmat yksityiskohdat ja se, onko
            //kyseessä monta laulua samasta tyypistä vai ainoastaan yksi laulu
            $details = $this->con->get("songsegments",
                ["id", "songdescription", "restrictedto", "singlename", "multiname"],
                ["id" => $slot["content_id"]]);
            $multi = ($details["multiname"] == "" ? false: true);
            $restr = ($details["restrictedto"] == "" ? false: true);
            if($restr){
                //Valinnat rajoitettu vain tiettyihin lauluihin
                $container = $this->template_engine->loadTemplate('restrictedsong'); 
                $container_params = ["select", "SELECT"];
            }
            else if($multi){
                //Monta laulua samaan slottiin
                $container = $this->template_engine->loadTemplate('multisong'); 
                $titles = $this->con->select("servicesongs", 
                    "song_title",
                    ["AND" => [
                        "service_id" => $this->id,
                        "stype" => $details["singlename"]
                    ]]);
                if(!$titles)
                    $titles = Array("");
                $songslots = "";
                foreach($titles as $title){
                    $output = $this->template_engine->loadTemplate('singlesong'); 
                    $songslots  .= "\n" . $output->render([
                        "category" => $slot["slot_name"],
                        "name" => "",
                        "value" => $title,
                        "isparent" => ""
                    ]);
                }
                $container_params = [
                    "multisongheader" => $details["multiname"],
                    "songslots" => $songslots
                ];
            }
            else{
                //Tavallinen tapaus: vain yksi laulu yhdessä slotissa
                $container = $this->template_engine->loadTemplate('singlesong'); 
                $title = $this->con->get("servicesongs", 
                    "song_title", 
                    ["AND" => [
                        "service_id" => $this->id],
                        "songtype" => $details["singlename"]
                    ]);
                if(!$title)
                    $title = "";
                $container_params = ["value" => $title, "isparent" => "slot-parent"] ;
            }
            $container_params = array_merge($container_params, ["category" => $slot["slot_name"]]);
            $this->slots_as_string .= $container->render($container_params);
        }

        return $this;
    }


}



?>
