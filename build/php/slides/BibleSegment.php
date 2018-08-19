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
class BibleSegment extends Slide{

    /**
     *
     * @param Object $m Mustache template-moottori
     * @param Array $details Dian tiedot: teksti, laulun nimi, kuvien läsnäolo tms.
     *
     */
    public function __construct($m, $details){
        parent::__construct($m, $details);
        $this->template_engine;
        $this->template = $this->template_engine->loadTemplate('biblesegment'); 
    }

    /**
     * Lisää html-esitykseen varsinaiset dian yksityiskohdat: säkeistöt, otsikkodia, yms.
     */
    public function SetDetails(){
        $this->SetVerses($this->details["verses"]);
            
        return $this;
    }


    /**
     * Asettaa osoitteen otsikon
     *
     * @param  string $address osoite
     */
    public function SetAddress($address){
        $this->Set("address",$address);
        return $this;
    }

    /**
     * Asettaa segmentin nimen
     *
     * @param  string $name segmentin nimi
     */
    public function SetSegmentName($name){
        $this->Set("name",$name);
        return $this;
    }
    

    /**
     * Asettaa raamatunkohdan varsinaisen sisällön eli jakeet. 
     *
     * @param  Array $verses jakeet ryhmiteltyinä kahden tai useamman ryppäiksi
     *
     */
    public function SetVerses($verses){
        $output = "";
        foreach($verses as $idx => $verse){
            $params = [];
            $tplname = "bibleverse";
            if($idx == 0){
                $tplname .= "_with_header";
                $params = 
                [
                    "name" => $this->details["segment_name"],
                    "address" => $this->details["address"],
                ];
            }
            $tpl = $this->template_engine->loadTemplate($tplname);
            $params["text"] = $verse;
            $output .= $tpl->render($params) . "\n";
        }

        $this->Set("verses",trim($output));

        return $this;
    }

}

?>
