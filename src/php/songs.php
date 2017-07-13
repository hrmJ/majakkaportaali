<?php
/**
 *
 * Sisältää oliot ja funktiot, jotka liittyvät laulujen syöttämiseen ja
 * lataamiseen.
 *
 */

/**
 *
 * Hakee messu-id:n, jos sitä ei ole asetettu.
 *
 * @return int päivämäärältään lähimmän messun id.
 *
 */

function GetIdByDate(){

    return 1;
}


/**
 *
 * Käsittelee lauluihin liittyvää tietokantadataa
 *
 */
class SongData{

    /**
     *
     *
     * @param SongCon $con yhteys tietokantaan
     *
     */
    public function __construct($con){
        $this->con = $con;
    }


    /**
     * Hakee kaikkien laulujen nimet tietokannasta ja tulostaa ne filtteröitynä
     * laulun nimen ja jonkin sen sisältämän merkkijonon mukaan.
     *
     * @param $title merkkijono, joka laulun nimestä on löydyttävä 
     *
     */
    public function OutputSongTitles($title){
        $this->titleslist = $this->con->q("SELECT title FROM songdata WHERE title LIKE :giventitle ORDER by title",Array("giventitle"=>"%$title%"),"all_flat");
        echo json_encode($this->titleslist);
    }

}

?>
