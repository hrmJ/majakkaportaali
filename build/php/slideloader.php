<?php
/**
 *
 * Olio, joka lataa sisältöjä ja tekee niistä diaesityksen.
 *
 */
class SlideLoader extends Template{

    /**
     * @param string $path polku tietokantakonfiguraatioon
     */
    public function __construct($path){
        $this->con = new DbCon($path);
        $this->genheader = "";
        $this->subgenheader = "";
        return $this;
    }

    /**
     * Asettaa ylimmän tason messuotsikon
     *
     * @param string $text otsikon teksti
     */
    public function SetGenHeader($text){
        $this->genheader = "<h1>$text</h1>";
        return $this;
    }

    /**
     * Asettaa toiseksi ylimmän tason messuotsikon
     *
     * @param string $text otsikon teksti
     */
    public function SetSubGenHeader($text){
        $this->subgenheader = "<h2>$text</h2>";
        return $this;
    }

    /**
     * Tulostaa valmiin dian
     *
     */
    public function OutputSlide(){
    }

}


?>
