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
 * Yhtä diaesityksen liturgista tekstielementtiä esittävä olio
 *
 **/
class Ltext extends Slide{

    /**
     *
     * @param Object $m Mustache template-moottori
     * @param Array $details Dian tiedot: teksti, laulun nimi, kuvien läsnäolo tms.
     * @param string $segment_name segmentin tunniste / otsikko
     *
     */
    public function __construct($m, $details, $segment_name){
        parent::__construct($m, $details);
        $this->template_engine;
        $this->segment_name = $segment_name;
        $this->template = $this->template_engine->loadTemplate('ltext'); 
    }

    /**
     * Lisää html-esitykseen varsinaiset dian yksityiskohdat: säkeistöt, otsikkodia, yms.
     */
    public function SetDetails(){
        $this->SetVerses($this->details["verses"]);
        return $this;
    }


    /**
     *
     * Lisää liturgisen tekstin "säkeistöt" eli näytöllä kerrallaan näkyvät osuudet
     *
     */
    public function SetVerses($verses){
        $output = "";
        foreach($verses as $idx => $verse){
            $verse = $verse["verse"];
            $params = [];
            $tplname = "ltextverse";
            if($idx == 0){
                $tplname .= "_with_header";
                $params["identifier"] = $this->segment_name;
                $params["header"] = "";
                if($this->details["use_as_header"]){
                    $params["header"] = $this->segment_name;
                }
            }
            $tpl = $this->template_engine->loadTemplate($tplname);
            $params["text"] = str_replace("\n","<br>\n",$verse);
            $output .= $tpl->render($params) . "\n";
        }

        $this->Set("verses",trim($output));
    }


}

?>
