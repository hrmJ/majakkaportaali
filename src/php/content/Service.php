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
     * Lataa tietokannasta kaikki messussa käytössä olevat laulutyypit
     * (määritelty service_structure.php-sivulla) ja syötä sivupohjaan
     * niiden mukaiset slotit lauluille.
     *
     */
    public function LoadStructure(){
        $slots = $this->con->select("service_specific_presentation_structure", 
            ["id",  "slot_name", "slot_number", "slot_type", "content_id", "addedclass", "header_id"],
            ['ORDER' => [ 'slot_number' => 'ASC' ]]);
        if( !$slots ){
            $slots = $this->con->select("presentation_structure", 
                ["id", "slot_name", "slot_type", "slot_number", "content_id", "addedclass", "header_id"],
                ['ORDER' => [ 'slot_number' => 'ASC' ]]);
        }
        return $this;
    }


}



?>
