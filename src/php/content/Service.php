<?php
/**
 *
 * Yhtä messua / palvelusta / tapahtumaa koskevat tiedot
 *
 */


namespace Portal\content;

use Medoo\Medoo;
use PDO;


/**
 *
 * Yksi messu / palvelus 
 *
 */
class Service{

    /**
     *
     * @param Medoo $con tietokantayhteys
     * @param integer $id messun id
     *
     */
    protected $con;
    public $id;

    /*
     *
     *
     */
    public function __construct(\Medoo\Medoo $con, $id){
        $this->con = $con;
        $this->id = $id;
    }

    /*
     * Hakee messun teeman
     *
     */
    public function GetTheme(){
        return $this->con->get("services","theme",["id" => $this->id]);
    }

    /*
     * Hakee messuihin tavallisesti liittyvät raamatunkohdat
     *
     * TODO: messukohtaiset
     *
     */
    public function GetBibleSegments(){
        $slots = $this->con->select("presentation_structure",
            ["slot_name", "content_id", "slot_number"],
            ["slot_type" => "biblesegment"],
            ['ORDER' => [ 'slot_number' => 'ASC' ]]
            );
        return $slots;
    }


    /*
     * Hakee messuun tarvittavat vastuuroolit ja niissä toimivat ihmiset
     *
     */
    public function GetResponsibles(){
        return $this->con->select("responsibilities",["responsibility","responsible"],["service_id" => $this->id]);
    }

    /**
     *
     * Tallentaa muutokset messun vastuunkantajiin
     *
     * @param Array $data taulukko muotoa [["responsible" => x, "responsibility" => "x"], ...]
     *
     */
    public function SaveResponsibles($data){
        foreach($data as $entry){
            $this->con->update("responsibilities",
                [
                    "responsible" => $entry["responsible"]
                ],
                [
                    "AND" => [
                         "service_id" => $this->id,
                         "responsibility" => $entry["responsibility"],
                    ]
                ]
                );
        }
        return $this;
    }

    /**
     *
     * Tallentaa muutokset messun perustietoihin kuten teemaan
     *
     * @param Array $data taulukko muotoa ....
     *
     */
    public function SaveDetails($data){
        foreach($data as $entry){
            switch($entry["type"]){
                case "theme":
                    $data = $this->con->update("services",
                        [
                            "theme" => $entry["value"] 
                        ],
                        [ 
                            "id" => $this->id
                        ]);
                    break;
            }
        }
        return $this;
    }


    /**
     *
     * Tallentaa muutokset messussa laulettaviin lauluihin
     *
     * @param Array $data taulukko muotoa [["responsible" => x, "responsibility" => "x"], ...]
     *
     */
    public function SaveSongs($data){
        $this->con->delete("servicesongs", ["service_id" => $this->id]);
        foreach($data as $entry){
            $this->con->insert("servicesongs",
                [
                    "service_id" => $this->id,
                    "song_title" => $entry["song_title"],
                    "song_id" => $entry["song_id"],
                    "songtype" => $entry["songtype"]
                ]
                );
        }
        return $this;
    }

}



?>
