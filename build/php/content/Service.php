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
        $cols = ["id", "slot_name", "content_id", "slot_number"];
        $service_specific = $this->con->select("service_specific_presentation_structure",
            $cols,
            ["service_id" => $this->id]
        );
        if($service_specific){
            //JOS on asetettu ylipäätään joitakin messuspesifejä slotteja, etsi
            //myös raamatunkohtia messuspesifien slottien joukosta
            $slots = $this->con->select("service_specific_presentation_structure",
                $cols, 
                [ "AND" => [
                    "slot_type" => "biblesegment",
                    "service_id" => $this->id
                    ],
                    "ORDER" => [ 'slot_number' => 'ASC' ]
                ]);
        }
        else{
            //Jos ei mitään messuspesifejä slotteja, etsi raamattuslotteja yleisestä
            $slots = $this->con->select("presentation_structure",
                $cols, 
                [ 
                    "slot_type" => "biblesegment",
                    "ORDER" => [ 'slot_number' => 'ASC' ]
                ]);
        }

        return $slots;
    }



    /*
     * Hakee yksittäiseen messuun määritetyt raamatunkohdat
     *
     */
    public function GetBibleSegmentsContent(){
        $data = [];
        $slots = $this->con->select("serviceverses",
            [
            "testament", "startbook",
            "endbook", "startchapter", "endchapter",
            "startverse", "endverse", "segment_name"
            ],
            ["service_id" => $this->id],
            ['ORDER' => [ 'id' => 'ASC' ]]
            );
        foreach($slots as $slot){
            if(!array_key_exists($slot["segment_name"],$data)){
                $data[$slot["segment_name"]] = [];
            }
            $data[$slot["segment_name"]][] = [
                "testament" => $slot["testament"],
                "startbook" => $slot["startbook"],
                "endbook" => $slot["endbook"], 
                "startchapter" => $slot[ "startchapter"],
                "endchapter" => $slot["endchapter"],
                "startverse" => $slot["startverse"],
                "endverse" => $slot["endverse"], 
                "segment_name" => $slot["segment_name"]
            ];
        }

        return $data;
    }

    /*
     * Hakee messuun tarvittavat vastuuroolit ja niissä toimivat ihmiset
     *
     */
    public function GetResponsibles(){
        return $this->con->select("responsibilities", 
            ["responsibility","responsible"],["service_id" => $this->id]);
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
        $this->con->delete("serviceverses",["service_id" => $this->id]);

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
                case "offerings":
                    $update_cond =  [
                        "target_id" => $entry["goal_id"],
                        "service_id" => $entry["service_id"],
                    ];
                    $update_vals = ["amount" => $entry["amount"]];
                    $this->con->delete("collected_offerings", ["service_id" => $entry["service_id"]]);
                    $this->con->insert("collected_offerings", 
                            array_merge($update_vals, $update_cond));
                    break;
                case "bible":
                    $this->con->insert("serviceverses", [
                        "service_id" => $this->id,
                        "testament" => $entry["testament"],
                        "startbook" => $entry["startbook"],
                        "startverse" => $entry["startverse"],
                        "startchapter" => $entry["startchapter"],
                        "endbook" => $entry["endbook"],
                        "endchapter" => $entry["endchapter"],
                        "endverse" => $entry["endverse"],
                        "segment_name" => $entry["segment_name"]
                        ]
                    );
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
        //TODO: kasvattaaako id:iten määrää liikaa?
        $this->con->delete("servicesongs", ["service_id" => $this->id]);
        $songlist = new Songlist($this->con, 0);
        foreach($data as $entry){
            if($entry["tag"]){
                $existing_tags = $songlist->LoadSongTags($entry["song_id"]);
                if(!in_array($entry["tag"], $existing_tags)){
                    //Jos tallennettu tägein rajoitettuun rooliin laulu, muttei vielä tägätty ko. laulua
                    $this->con->insert("songtags",
                        [
                        "tag"=>$entry["tag"],
                        "song_id"=>$entry["song_id"]
                        ]);
                }
            }
            $this->con->insert("servicesongs",
                [
                    "service_id" => $this->id,
                    "song_title" => $entry["song_title"],
                    "verses" => $entry["verses"],
                    "is_instrumental" => $entry["is_instrumental"],
                    "song_id" => $entry["song_id"],
                    "songtype" => $entry["songtype"]
                ]
                );
        }
        return $this;
    }

    /**
     *
     * Tallentaa teeman ja päivämäärän
     *
     * @param Array $newvals taulukko muotoa [["servicedate" => x, "theme" => "x"], ...]
     *
     */
    public function SaveThemeAndDate($newvals){
        $this->con->update("services", $newvals, ["id" => $this->id]);
        return $this;
    }


}



?>
