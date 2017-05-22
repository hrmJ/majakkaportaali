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
 * Lähtökohta: http://www.
 *
 * @param file {string}
 * @param values {array}
 *
 */
class Template{
    protected $file;
    protected $values = Array();

    /**
     * @param file {string} pohjan tiedostonimi
     */
    public function __construct($file){
        $this->file = $file;
    }
}



?>

