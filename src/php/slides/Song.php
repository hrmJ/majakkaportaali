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
     * @param Array $details Dian tiedot: teksti, laulun nimi, kuvien läsnäolo tms.
     *
     */
    public function __construct($m, $details){
        parent::__construct($m, $details);
        $this->template_engine;
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
        foreach($verses as $verse){
            if(trim($verse)){
                $tpl = $this->template_engine->loadTemplate("verse");
                $output .= "{$tpl->render(["text" => str_replace("\n","<br>\n",$verse)])}\n";
            }
        }
        $this->Set("verses",trim($output));
        return $this;
    }


}

?>
