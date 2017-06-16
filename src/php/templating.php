<?php
/**
 * Sisältää oliot ja funktiot, jotka liittyvät pohjien (templates) käyttöön.
 *
 */


/**
 *
 * Sivupohjaolio, joka vastaa sisällön näyttämisestä.
 * Jokainen sivu, joka luodaan, on oma Template-luokan
 * olionsa.
 *
 * Lähtökohta: http://www.broculos.net/2008/03/how-to-make-simple-html-template-engine.html#.WScryR_S3UI
 *
 * @param string $file pohjan tiedostonimi sisältäen koko suhteellisen hakemistopolun kutsujatiedostosta katsoen. (esim. templates/x.tpl)
 * @param array $values mitä pohjaan syötetään
 *
 */
class Template{
    protected $file;
    protected $values = Array();

    /**
    * @param string $file pohjan tiedostonimi
    */
    public function __construct($file){
        $this->file = $file;
    }

    /**
    *
    * Syöttää pohjaan arvoja: esimerkiksi sen, mikä merkkijono (html-koodi) korvaa
    * pohjassa olevan [@table]-paikanmerkin.
    *
    * @param string $bookmark Se kohta pohjaa, joka korvataan ("kirjanmerkki")
    * @param string $content Html-sisältö, joka syötetään kirjanmerkin paikalle
    *
    */
    public function Set($bookmark, $content){
        $this->values[$bookmark] = $content;
    }

    /**
    *
    * Tulostaa pohjan, johon arvot on syötetty. Palauttaa pohjan merkkijonona.
    *
    * @return string pohja, joka tulostetaan
    *
    */
    public function Output(){
        if(!file_exists($this->file))
            return "Error loading template file: $this->file";

        $output = file_get_contents($this->file);

        foreach($this->values as $bookmark => $content){
            $tagToReplace = "[@$bookmark]";
            $output = str_replace($tagToReplace, $content, $output);
        }

        return $output;
    }

}

/**
 *
 * Edustaa taulukkoa, joka voidaan tulostaa sivulle esimerkiksi messujen listan
 * kuvaamiseen.
 *
 * @param array $rows taulukon rivit, joista kukin on oma servicelistrow-pohjansa
 *
 */
class DataTable{


    protected $rows = Array();

    public function __construct(){
        foreach($this->data as $datarow){
            $tpl = new Template($this->templatefile);
            if($this->type=="list"){
                $tpl->Set("category", FormatDate($datarow["servicedate"]));
                $tpl->Set("value", $datarow["theme"]);
                $tpl->Set("id", $datarow["id"]);
            }
            elseif($this->type=="details"){
                $tpl->Set("category", $datarow["responsibility"]);
                $tpl->Set("value", $datarow["responsible"]);
                $tpl->Set("name", $datarow["responsibility"]);
            }
            $this->rows[] = $tpl;
        }
    }


    /**
     *
     * Yhdistää solut ja palauttaa taulukon merkkijonona
     *
     * @return string taulukko merkkijonona
     *
     */
    public function Output(){
        $output = "";
        foreach($this->rows as $row){
            $output .= "\n" . $row->Output();
        }
        return $output;
    }

}

/**
 *
 * Taulukko messujen listan kuvaamista varten.
 *
 * @param string $type taulukon tyyppi 
 *
 */
class ServiceListTable extends DataTable{

    protected $type = "list";

    /**
     *
     *@param string $path polku templates-kansioon
     *@param Array $servicedata taulukkojen taulukko;  sisemmän taulukon alkiot nimillä "servicedate" ja "theme"
     *
     */
    public function __construct($path, $servicedata){
        $this->templatefile = "$path/servicelistrow.tpl";
        $this->data = $servicedata;
        parent::__construct();
    }

}


/**
 *
 * Taulukko yksittäisen messun responsibilitynkantajien kuvaamista varten.
 *
 * @param string $type taulukon tyyppi
 *
 */
class ServiceDetailsTable extends DataTable{

    protected $type = "details";

    /**
     *
     *@param string $path polku templates-kansioon
     *@param Array $servicedata taulukkojen taulukko;  sisemmän taulukon alkiot nimillä "responsibility" ja "responsible"
     *
     */
    public function __construct($path, $servicedata){
        $this->templatefile = "$path/servicedetailsrow.tpl";
        $this->data = $servicedata;
        parent::__construct();
    }

}


/**
 *
 * Taulukko yksittäisen messun responsibilitynkantajien kuvaamista varten.
 *
 * @param string $type taulukon tyyppi
 *
 */
class Select extends Template{

    protected $type = "details";

    /**
     *
     * @param string $path polku templates-kansioon
     * @param array $optiondata taulukko arvoista, jotka syötetään select-elementin riveiksi
     * @param string $selected se arvo, joka valitaan, kun elementti luodaan
     * @param string $label select-elementin ensimmäinen, otsikkona toimiva  arvo
     * @param array $valuedata option-elementin value-attribuutin arvot taulukkona
     *
     */
    public function __construct($path, $optiondata, $selected, $label, $id="", $valuedata=Array()){
        parent::__construct("$path/select.tpl");
        $optiondata = array_merge(Array(Array($label),Array("------------")), $optiondata);
        $options="";
        foreach($optiondata as $key=>$option){
            $tpl = new Template("$path/option.tpl");
            $tpl->Set("content",$option[0]);
            if($option[0]==$selected)
                $tpl->Set("selected","selected");
            else
                $tpl->Set("selected","");
            if(sizeof($optiondata)==sizeof($valuedata))
                $tpl->Set("value",$valuedata[$key]);
            else
                $tpl->Set("value",$option[0]);
            $options .= $tpl->Output();
        }
        $this->Set("content",$options);
        $this->Set("id",$id);
    }

}

?>

