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

    /**
     *
     *
     * @param string $path suhteellinen polku templates-kansioon
     * @param Array $servicedata taulukko, jossa messut riveinä, riveillä päivämäärä + teema
     *
     */
    public function __construct($path, $servicedata){
        foreach($servicedata as $datarow){
            if($this->type=="list"){
                $tpl = new Template("$path/servicelistrow.tpl");
                $tpl->Set("category", FormatDate($datarow["servicedate"]));
                $tpl->Set("value", $datarow["theme"]);
                $tpl->Set("id", $datarow["id"]);
            }
            elseif($this->type=="details"){
                $tpl = new Template("$path/servicelistrow.tpl");
                $tpl->Set("category", $datarow["vastuu"]);
                $tpl->Set("value", $datarow["vastuullinen"]);
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
 */
class ServiceListTable extends DataTable{

    protected $type = "list";

    public function __construct($path, $servicedata){
        parent::__construct($path, $servicedata);
    }

}


/**
 *
 * Taulukko yksittäisen messun vastuunkantajien kuvaamista varten.
 *
 */
class ServiceDetailsTable extends DataTable{

    protected $type = "details";

    public function __construct($path, $servicedata){
        parent::__construct($path, $servicedata);
    }

}


?>

