<?php
/**
 *
 * Pohjien (templates) käytän perustana oleva luokka.
 *
 */

namespace Portal\templates;

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
        return $this;
    }

    /**
    *
    * Gets the values array
    *
    * @return the values array.
    *
    */
    public function GetValues(){
        return $this->values;
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

    /**
     *
     * Yhdistää esimerkiksi taulukon solut tai listan rivit ja palauttaa
     * taulukon/listan merkkijonona
     *
     * @return string taulukko merkkijonona
     *
     */
    public function OutputRows(){
        $output = "";
        foreach($this->rows as $row){
            $output .= "\n" . $row->Output();
        }
        return $output;
    }

}


?>

