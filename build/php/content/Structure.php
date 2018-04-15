<?php


namespace Portal\content;

use Medoo\Medoo;
use PDO;


/**
 *
 * Messujen oletusrakenteen määritteleminen
 *
 */
class Structure{

    /**
     *
     * @param Medoo $con tietokantayhteys
     * @param Mustache $template_engine Mustache-template engine
     * @param string $slotstring Kaikki messun rakenne-elementit merkkijonona (html)
     *
     */
    protected $con;
    public $template_engine;
    public $slotstring;

    /*
     *
     *
     */
    public function __construct(\Medoo\Medoo $con, $m){
        $this->con = $con;
        $this->template_engine = $m;
    }


    /*
     *
     *
     */
    public function LoadSlots(){
        $slots = $this->con->select("presentation_structure", 
            ["id", "slot_name", "slot_type", "slot_number", "content_id", "addedclass", "header_id"],
            ['ORDER' => [ 'slot_number' => 'ASC' ]]);
        $this->slotstring = "";
        foreach($slots as $slot){
            $newslot = $this->template_engine->loadTemplate('slot'); 
            $name = (empty($slot["slot_name"]) ? "Nimetön segmentti" : $slot["slot_name"]);
            $this->slotstring .= "\n\n " . $newslot->render([
                "number" => $slot["slot_number"],
                "addedclass" => $slot["addedclass"],
                "content_id" => $slot["content_id"],
                "header_id" => $slot["header_id"],
                "slot_type" => $this->FormatSlotName($slot["slot_type"]),
                "slot_type_orig" =>$slot["slot_type"],
                "slot_id" =>$slot["id"],
                "slot_name_orig" =>$name,
                "slot_id" =>$slot["id"]
            ]);
        }
        return $this;
    }


    /**
     * Tulostaa sivun
     */
    public function OutputPage(){
        $page = $this->template_engine->loadTemplate('service_structure'); 
        return $page->render(["units" => $this->slotstring]);
    }

    /**
     * Muokkaa segmentin tyypistä järkevä suomenkielinen selite.
     */
    public function FormatSlotName($name){
        switch($name){
            case "infosegment":
                return "Infodia";
            case "songsegment":
                return "Laulu";
            case "biblesegment":
                return "Raamatunkohta";
        }
    }

}



?>
