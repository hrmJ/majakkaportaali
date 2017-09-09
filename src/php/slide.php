<?php
/**
 *
 * Edustaa yhtä diaesityksen diaa
 *
 */
class Slide extends Template{

    /**
     * @param string $path polku tietokantakonfiguraatioon
     */
    public function __construct($path){
        parent::__construct("$path/slide.tpl");
    }

    /**
     * Asettaa ylimmän tason messuotsikon
     *
     * @param string $text otsikon teksti
     */
    public function SetGenHeader($text){
        $this->Set("genheader",($text != "" ? "<h1>$text</h1>" : ""));
        return $this;
    }

    /**
     * Asettaa toiseksi ylimmän tason messuotsikon
     *
     * @param string $text otsikon teksti
     */
    public function SetSubGenHeader($text){
        $this->Set("subgenheader",($text != "" ? "<h2>$text</h2>" : ""));
        return $this;
    }

    /**
     * Tulostaa valmiin dian
     *
     */
    public function OutputSlide(){
        $this->Set("class",$this->class);
        $this->Set("content",$this->content_template->Output());
        return $this->Output();
    }

}

/**
 * Infodian pohja
 *
 * @param class Dian tyyppi
 *
 */
class InfoSlide extends Slide{

    protected $class = "info";

    public function __construct($path){
        parent::__construct($path);
        $this->content_template = new Template("$path/infoslide_content.tpl");
    }

    /**
     * Asettaa dian oman otsikon
     *
     * @param string $text  otsikkoteksti
     */
    public function SetHeaderText($text){
        $this->content_template->Set("header",($text != "" ? "<h3>$text</h3>" : ""));
        return $this;
    }

    /**
     * Asettaa Varsinaisen infotekstin
     *
     * @param string $text  infoteksti
     */
    public function SetMainText($text){
        $this->content_template->Set("maintext",$text);
        return $this;
    }

}



?>
