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
     * @param string $title merkkijono, joka laulun nimestä on löydyttävä 
     * @param boolean $checkfullname etsitäänkö merkkijonon osilla vai täsmällisellä merkkijonolla
     *
     */
    public function OutputSongTitles($title, $checkfullname=false){
        if ($checkfullname){
            $this->titleslist = $this->con->q("SELECT title FROM songdata WHERE title = :giventitle ORDER by title",Array("giventitle"=>$title),"all_flat");
        }
        else{
            $this->titleslist = $this->con->q("SELECT title FROM songdata WHERE title LIKE :giventitle ORDER by title",Array("giventitle"=>"%$title%"),"all_flat");
        }
        echo json_encode($this->titleslist);
    }

    /**
     * Hakee laulun tarkat tiedot tietokannasta
     *
     * @param string $title laulun tarkka nimi
     *
     */
    public function OutputSongInfo($title){
        
        $row = $this->con->q("SELECT title, verses FROM songdata WHERE title = :giventitle ORDER by title",Array("giventitle"=>$title),"row");
        $this->songcontent = Array("title"=>$row["title"],"verses"=>$row["verses"]);
        echo json_encode($this->songcontent);
    }


    /**
     * Tallentaa muokatut laulun sanat
     *
     * @param string $title laulun tarkka nimi
     * @param string $verses kahdella rivivälillä toisistaan erotetut laulujen sanat
     *
     */
    public function ProcessEditedLyrics($title, $verses){
        $existingdata = $this->con->q("SELECT title FROM songdata WHERE title = :giventitle",Array("giventitle"=>$title),"row");
        if(!$existingdata)
           $this->con->q("INSERT INTO  songdata (title, verses) VALUES (:giventitle, :versedata)",Array("giventitle"=>$title, "versedata"=>$verses),"none");
        else
            $this->con->q("UPDATE songdata SET verses = :versedata WHERE title = :giventitle",Array("giventitle"=>$title, "versedata"=>$verses),"none");
    }

}

?>
