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
     *
     */
    public function __construct($m, $details, $picked_verses){
        parent::__construct($m, $details);
        $this->template_engine;
        $this->picked_verses = ($picked_verses ? explode(",", $picked_verses) : "");
        $this->template = $this->template_engine->loadTemplate('song'); 
    }

    /**
     * Lisää html-esitykseen varsinaiset dian yksityiskohdat: säkeistöt, otsikkodia, yms.
     */
    public function SetDetails(){
        $this->SetTitle($this->details["title"])
            ->SetComposer($this->details["composer"])
            ->SetLyrics($this->details["lyrics"])
            ->SetVerses($this->details["verses"]);
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
