<?php
/**
 *
 * Messun  rakennesivun template.
 *
 * @param string $type mistä sivutyypistä on kyse.
 * @param string $elements html-esitys messun muodostavista elementeistä
 * @param Array $slots messun rakenneyksiköt
 *
 */
class StructurePage extends Page{

    public $type = "service_structure";
    public $elements = "service_structure";
    public $slots = Array();

    /**
     *
     * @param string $path polku templates-kansioon
     * @param DbCon $con tietokantayhteys
     *
     */
    public function __construct($path, $con){
        $this->path = $path;
        $this->con = $con;
        parent::__construct();
    }

    /**
     *
     * Lataa jo olemassaolevat messun rakennepalikat.
     *
     */
    public function LoadSlots(){
        $slots = $this->con->q("SELECT id, slot_name, slot_type, slot_number, content_id, addedclass FROM presentation_structure ORDER by slot_number",Array(),"all");
        $slotstring = "";
        foreach($slots as $slot){
            $newslot = new Template("{$this->path}/slot.tpl");
            $name = (empty($slot["slot_name"]) ? "Nimetön segmentti" : $slot["slot_name"]);
            $newslot->Set("name",$name)
                ->Set("number", $slot["slot_number"])
                ->Set("addedclass", $slot["addedclass"])
                ->Set("content_id",$slot["content_id"])
                ->Set("slot_type",FormatSlotName($slot["slot_type"]))
                ->Set("slot_type_orig",$slot["slot_type"])
                ->Set("slot_id",$slot["id"])
                ->Set("slot_name_orig",$name)
                ->Set("slot_id",$slot["id"]);
            $slotstring .= "\n\n{$newslot->Output()}";
        }
        $this->slotstring = $slotstring;
        $this->Set("units", $slotstring);
    }


    /**
     *
     * Lisää esitysrakenteeseen uusi elementti
     *
     */
    public function InsertElementAdder(){
        $this->addermenu = new UiMenu($this->path, Array("Yksittäinen dia"=>Array("Infodia","Kuva","Otsikko"),"Laulu"));
        $this->addermenu->Set("defaulttext","Uusi messuelementti")->Set("id","");
        $this->Set("addermenu",$this->addermenu->Output());
        return $this;
    }

}

/**
 * Muokkaa segmentin tyypistä järkevä suomenkielinen selite.
 */
function FormatSlotName($name){
    switch($name){
        case "infosegment":
            return "Infodia";
        case "songsegment":
            return "Laulu";
    }
}

?>
