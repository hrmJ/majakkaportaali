<?php
/**
 *
 * Messun rakenneyksikkö
 *
 */
class Slot extends Template{


    /**
     *
     * @param string $path polku templates-kansioon
     *
     */
    public function __construct($path, $name, $number, $content_id,$slot_id){
        $this->path = $path;
        $this->name = $name;
        $this->number = $number;
        $this->content_id = $content_id;
        $this->slot_id = $slot_id;
        $this->file = "$path/slot.tpl";
    }

    /**
     * Palauttaa valmiin html-esityksen
     *
     * @return string html-esitys rakenneyksiköstä
     *
     */
    public function OutputSlot(){
        $this->Set("number",$this->number)
            ->Set("name",$this->name)
            ->Set("content_id",$this->content_id);
        return $this->Out();
    }


}



?>
