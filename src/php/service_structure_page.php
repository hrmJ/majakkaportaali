<?php
/**
 *
 * Messun  rakennesivun template.
 *
 * @param string $type mistä sivutyypistä on kyse.
 * @param string $elements html-esitys messun muodostavista elementeistä
 *
 */
class StructurePage extends Page{

    public $type = "service_structure";
    public $elements = "service_structure";

    /**
     *
     * @param string $path polku templates-kansioon
     * @param string $id sen messun id, jonka lauluja käsitellään
     *
     */
    public function __construct($path){
        $this->path = $path;
        parent::__construct();
    }

    /**
     *
     */
    public function SetSomething(){
        return $this;
    }

    /**
     *
     * Lisää esitysrakenteeseen uusi elementti
     *
     */
    public function InsertElementAdder(){
        $this->addermenu = new UiMenu($this->path, Array("Yksittäinen dia","Laulu","Monta laulua"));
        $this->addermenu->Set("defaulttext","Uusi messuelementti")->Set("id","");
        $this->Set("addermenu",$this->addermenu->Output());
        return $this;
    }

}

?>
