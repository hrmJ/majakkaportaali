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
class Song extends Slide{

    /**
     *
     * @param Object $m Mustache template-moottori
     * @param Array $details laulun säkeistöt ja metatiedot
     * @param String $picked_verses pilkuin erotettu lista säkeistöstä, jotka valittu mukaan
     * @param String $is_instrumental 'yes' tai 'no' riippuen siitä, onko esitysbiisi vai laulettava
     * @param String $song_title laulun otsikko: tarvitaan siltä varalta, ettei sanoja, mutta otsikko
     * @param String $segment_name laulunslotin nimi
     * @param boolean $segment_name_is_title käytetäänkö otsikkona laulun nimen sijaan segmentin nimeä
     *
     */
    public function __construct($m, $details, $picked_verses, $is_instrumental, $song_title, $segment_name = "", $segment_name_is_title){
        parent::__construct($m, $details);
        $this->template_engine;
        $this->picked_verses = ($picked_verses ? explode(",", $picked_verses) : "");
        $this->is_instrumental = $is_instrumental;
        $this->song_title = $song_title;
        $this->segment_name = $segment_name;
        $this->segment_name_is_title = $segment_name_is_title;
        $this->template = $this->template_engine->loadTemplate('song'); 
    }

    /**
     *
     * Lisää html-esitykseen varsinaiset dian yksityiskohdat: säkeistöt, otsikkodia, yms.
     *
     */
    public function SetDetails(){
        if($this->is_instrumental == "yes"){
            $this->SetTitle($this->song_title . " (ei yhteislaulu)");
        }
        else{
            $title = $this->segment_name_is_title ? $this->segment_name : $this->details["title"];
            $composer = $this->details["composer"] ? "Säv. " . $this->details["composer"] : "";
            $lyrics = $this->details["lyrics"] ? "San. " . $this->details["lyrics"] : "";
            $this->SetTitle($title)
                ->SetComposer($composer)
                ->SetLyrics($lyrics)
                ->SetSegmentName($this->details["composer"])
                ->SetVerses($this->details["verses"]);
        }
        return $this;
    }


    /**
     * Asettaa segmentin nimin
     *
     */
    public function SetSegmentName(){
        if($this->segment_name){
            $this->Set("segment_name","{$this->segment_name}: {$this->song_title}");
        }
        else{
            $this->Set("segment_name",$this->$song_title);
        }
        return $this;
    }



    /**
     * Asettaa laulun otsikon
     *
     * @param  string $title laulun otsikko
     */
    public function SetTitle($title){
        $this->Set("title",$title);
        return $this;
    }

    /**
     * Asettaa laulun sanoittajan
     *
     * @param  string $lyricsby laulun sanoittaja
     */
    public function SetLyrics($lyricsby){
        $this->Set("lyrics",$lyricsby);
        return $this;
    }
    
    /**
     * Asettaa laulun säveltäjän 
     *
     * @param  string $composer laulun säveltäjä
     */
    public function SetComposer($composer){
        $this->Set("composer",$composer);
        return $this;
    }

    /**
     * Asettaa laulun säkeistöt. Säkeistöt pilkotaan ensin kahden tai useamman
     * rivivälin perusteella ja jokaisesta säkeistöstä luodaan oma pohjansa
     * (src/templates/verse.tpl).
     *
     * @param  string $versestring laulun säkeistöt yhtenä pitkänä merkkijonona
     *
     */
    public function SetVerses($verses){
        $output = "";
        foreach($verses as $idx => $verse){
            if(trim($verse)){
                if($this->picked_verses == "" or in_array($idx+1, $this->picked_verses)){
                    //Ota säkeistö mukaan vain jos valittu
                    $tpl = $this->template_engine->loadTemplate("verse");
                    $output .= "{$tpl->render(["text" => str_replace("\n","<br>\n",$verse)])}\n";
                }
            }
        }
        $this->Set("verses",trim($output));
        return $this;
    }


}

?>
