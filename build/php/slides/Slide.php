<?php
/**
 *
 * Yhden messun laulut ja niiden syöttäminen
 *
 */


namespace Portal\slides;

use Medoo\Medoo;
use PDO;


/**
 *
 * Yhtä diaesityksen elementtiä esittävä olio
 *
 * @param $render_array renderöitävät arvot sisällään pitävä taulukko
 *
 **/
class Slide{

    public $render_array = [];

    /**
     *
     * @param Object $m Mustache temlate-moottori
     * @param Array $details Dian tiedot: teksti, laulun nimi, kuvien läsnäolo tms.
     *
     */
    public function __construct($m, $details){
        $this->details = $details;
        $this->template_engine = $m;
    }


    /**
     *
     * Asettaa renderöitäviä arvoja
     *
     */
    public function Set($key, $val){
        $this->render_array[$key] = $val;
    }


    /**
     *
     * Renderöi html:n
     *
     */
    public function Output(){
        return $this->template->render($this->render_array);
    }

    /**
     *
     * Varmista, että ensimmäinen dia on oletuksena ensimmäinen näytettävä 
     *
     * @param integer $slide_idx kuinka mones dia kyseessä
     */
    public function MarkIfFirst($slide_idx){
        if($slide_idx==0)
            $this->Set("iscurrent","current");
        else
            $this->Set("iscurrent","");
        return $this;
    }

    /**
     * Asettaa diaan käyttäjän määrittelemän luokan. Näiden perusteella
     * dioja voidaan jaotella esimerkiksi eri messun osien mukaisesti
     *
     * @param  string $addedclass määritelty luokka
     */
    public function SetAddedClass($addedclass){
        $this->Set("addedclass",str_replace(".","",$addedclass));
        return $this;
    }

    /**
     * Asettaa käyttäjän määrittelemän ylätunnisteen
     *
     * @param string $header_id ylätunnisteen numero
     * @param DbCon $con tietokantayhteys
     *
     */
    public function SetPageHeader($header_id, $con){
        $headercontent = "";
        if($header_id){
            $headerdata = $con->get("headers", 
                ["maintext", "imgname", "imgposition", "is_aside"],
                ["id" => $header_id]);
            $header_type = ($headerdata["is_aside"] == 1 ? "aside" : "header");
            #LEGACY HACK:
            $header_tpl = new Slide($this->template_engine, []);
            $header_tpl->template = $this->template_engine->loadTemplate($header_type);
            $text = "<div>{$headerdata["maintext"]}</div>";
            if ($headerdata["imgname"] and $headerdata["imgname"] !== "Ei kuvaa"){
                //Jos tähän ylätunnisteeseen liittyy kuva
                $header_tpl->SetImg($headerdata["imgname"],$headerdata["imgposition"],"content",$text);
            }
            else{
                $header_tpl->Set("content",$text);
            }
            $headercontent = $header_tpl->Output();
        }
        $this->Set("header",$headercontent);
        return $this;
    }


    /**
     * Asettaa kuvan, jonka on tarkoitus näkyä ennen (joko vasemmalla tai
     * yläpuolella) tekstiä, tekstin jälkeen (joko oikealla tai alapuolella)
     * tai tuhoaa kuville tarkoitetut slotit, jos kuvaa ei asetettu.
     *
     * @param  string $imgpath polku kuvaan
     * @param  string $imgpos kuvan sijainti
     * @param  string $target_in_template se paikanmerkki templeitissä, johon kuva syötetään, esim. [@imgdiv]
     * @param  string $txt teksti, joka kuvan yhteyteen tulee
     */
    public function SetImg($imgpath, $imgpos, $target_in_template, $txt){
        $img_template = $this->template_engine->loadTemplate("slide_img");
        $params = ["img_before" => "", 
            "img_after" => "",
            "imgclass"=> "img-$imgpos",
            "text" => $txt
        ];

        //TODO oikea polku
        $img = "<img src='../assets/images/$imgpath'>";

            switch ($imgpos){
                case "left":
                case "wholescreen":
                case "top":
                    $params["img_before"] = $img;
                    break;
                case "right":
                case "bottom":
                    $params["img_after"] = $img;
                    break;
                case "wholescreen":
                    $img_template->Set("img_before",$img);
                    break;
            }

        $this->Set($target_in_template, $img_template->render($params));

        return $this;
    }


}

?>
