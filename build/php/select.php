<?php

/**
 *
 * Select-valintaelementti
 *
 * $options Array taulukko, johon tallennetaan valittavat elementit 
 * $optionvalues Array taulukko, johon tallennetaan valintojen arvot
 * $id string elementin id-attribuutin arvo
 * $class string elementin class-attribuutin arvo
 *
 */
class Select extends Template{

    private $options = Array();
    private $optionvalues = Array();
    private $id = "";
    private $class = "";

    /**
     *
     * @param string $path polku templates-kansioon
     * @param array $optiondata taulukko arvoista, jotka syötetään select-elementin riveiksi
     *
     */
    public function __construct($path, $optiondata){
        parent::__construct("$path/select.tpl");
        foreach($optiondata as $option){
            $this->optionvalues[] = $option;
            $opt_tpl = new Template("$path/option.tpl");
            $opt_tpl->selected = False;
            $this->options[] = $opt_tpl->Set("content",$option);
        }
    }


    /**
     *
     * Korvaa option-elementtien value-attribuuttien arvot halutuilla
     *
     * @param Array $values Taulukko, joka sisältää uudet arvot
     *
     */
    public function SetValues($values){
        foreach($values as $idx=>$value){
            $this->optionvalues[$idx] = $value;
        }
        return $this;
    }

    /**
     *
     * Aseta select-elementille id
     *
     * @param string $id uusi id
     *
     */
    public function SetId($id){
        $this->id = $id;
        return $this;
    }

    /**
     *
     * Aseta select-elementille luokka
     *
     * @param string $class uusi luokka
     *
     */
    public function SetClass($class){
        $this->class = $class;
        return $this;
    }


    /**
     *
     * Valitse, mikä option-elementeistä on oletuksena valittuna
     *
     * @param string $selectedval se arvo, joka valitaan
     *
     */
    public function SetCurrentSelected($selectedval){
        foreach($this->optionvalues as $idx=>$val){
            if($val==$selectedval)
                $this->options[$idx]->selected = True;
        }
        return $this;
    }

    /**
     *
     * Tulostaa valmiin select-elementin. 
     *
     * @return string Valmis html-representaatio
     *
     */
    public function OutputSelect(){
        $outstring = "";
        foreach($this->options as $idx=>$option){
            $selected = ($option->selected ? " selected": "");
            $option->Set("value",$this->optionvalues[$idx])->Set("selected",$selected);
            $outstring .= "\n{$option->Output()}";
        }
        return $this->Set("id",$this->id)->Set("class",$this->class)->Set("content",$outstring)->Output();
    }
}


?>
