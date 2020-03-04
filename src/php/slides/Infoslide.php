<?php

namespace Portal\slides;

use Medoo\Medoo;
use Michelf\Markdown;
use PDO;

/**
 *
 * Slide-oliosta periytyvä yhtä diaesityksen laulua esittävä olio
 * @param Array $details Dian tiedot: teksti, laulun nimi, kuvien läsnäolo tms.
 * @param string $slot_name infosegmentin tunniste
 *
 */
class Infoslide extends Slide
{
    /**
     *
     * @param Object $m Mustache template-moottori
     * @param Array $details Dian tiedot: teksti, laulun nimi, kuvien läsnäolo tms.
     *
     */
    public function __construct($m, $details, $slot_name)
    {
        parent::__construct($m, $details);
        $this->template_engine;
        $this->segment_name = $slot_name;
        $this->template = $this->template_engine->loadTemplate('infoslide');
        $this->details["maintext"] = preg_replace(
            '/\n{2,}/',
            '<br>',
            $this->details["maintext"]
        );
        #Markdown conversion:
        // $this->details["maintext"] = Markdown::defaultTransform(
        //     $this->details["maintext"]
        // );
    }

    /**
     * Lisää html-esitykseen varsinaiset dian yksityiskohdat: tekstit, otsikot, kuvat...
     */
    public function SetDetails()
    {
        if (
            $this->details["imgname"] and
            $this->details["imgname"] != "Ei kuvaa"
        ) {
            //Jos tähän diaan kuuluu kuva, syötetään teksti kuvan yhteydessä
            $this->SetImg(
                $this->details["imgname"],
                $this->details["imgposition"],
                "content",
                $this->details["maintext"]
            );
        } else {
            //Muutoin teksti erikseen:
            $this->Set("content", $this->details["maintext"]);
        }

        $this->SetServiceheader($this->details["genheader"])
            ->SetServiceTheme($this->details["subgenheader"])
            ->SetSlideHeader($this->details["header"])
            ->SetSegmentName();
        return $this;
    }

    /**
     * Asettaa infodian tunnisteen
     *
     */
    public function SetSegmentName()
    {
        $this->Set("segment_name", $this->segment_name);
        return $this;
    }

    /**
     * Asettaa ylimmän tason otsikon
     *
     * @param  string $title otsikko
     */
    public function SetServiceheader($title)
    {
        $this->Set("serviceheader", $title);
        return $this;
    }

    /**
     * Asettaa seuraavan tason yläotsikon
     *
     * @param  string $theme laulun sanoittaja
     */
    public function SetServiceTheme($theme)
    {
        $this->Set("servicetheme", $theme);
        return $this;
    }

    /**
     * Asettaa diakohtaisen otsikon
     *
     * @param  string $header dian otsikko
     */
    public function SetSlideHeader($header)
    {
        $this->Set("slideheader", $header);
        return $this;
    }
}

?>
