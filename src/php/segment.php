<?php
/**
 *
 * Edustaa yhtä diaesityksen palasta (laulu, infodia, raamatunkohta), joka
 * voi koostua yhdestä tai useammasta diasta
 *
 * @param Array $slides diat, joista segmentti koostuu
 *
 */
class Segment extends Template{

    protected $slides = Array();

    /**
     * @param string $path polku pohjien kansioon
     */
    public function __construct($path){
        $this->path=$path;
        parent::__construct("$path/segment.tpl");
        return $this;
    }


    /**
     * Tulosta koko segmentti dioineen.
     */
    public function OutputSegment(){
        $slides = "";
        foreach($this->Slides as $slide){
            $slides .= "{$slide->OutputSlide()}\n\n";
        }
        $this->Set("class",$this->class);
        $this->Set("content",$slides);
        return $this->Output();
    }

}

/**
 *
 * Yksittäisiä dioja, esimerkiksi ehtoolliskäytännöistä kertovia ohjeita / lyhyitä mainoksia ym.
 *
 * @param string $class Segmentin tyyppi (info, song, etc.)
 *
 */
class InfoSegment extends Segment{

    protected $class = "infocontent";

    /**
     * @param string $path polku pohjien kansioon
     */
    public function __construct($path){
        parent::__construct($path);
    }


    /**
     * Lisää uusi dia tämän segmentin sisään
     *
     * @param string $maintext dian tekstisisältö
     * @param string $header tekstisisällöstä kertova otsikko
     * @param string $genheader koko messun otsikko
     * @param string $subgenheader koko messun alaotsikko
     * 
     */
    public function AddSlide($maintext="",$header="",$genheader="",$subgenheader=""){
        $slide =  new InfoSlide($this->path);
        $slide
            ->SetGenHeader($genheader)
            ->SetSubGenHeader($subgenheader)
            ->SetHeaderText($header)
            ->SetMainText($maintext);
        $this->Slides[] = $slide;
    }
}


?>
