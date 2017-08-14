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
 * @param DbCon $con yhteys tietokantaan
 *
 * @return int päivämäärältään lähimmän messun id.
 *
 */
function GetIdByDate($con, $date){
    //Pyri ensiksi löytämään lähin sunnuntai tulevaisuudesta
    $id = $con->q("SELECT id FROM services WHERE servicedate >= :today ORDER BY servicedate",Array("today"=>$date), "column");
    //Jos ei löydy, ota lähin menneisyydestä
    $id = ($id ? $id: $con->q("SELECT id FROM services WHERE servicedate < :today ORDER BY servicedate DESC",Array("today"=>$date), "column"));
    return $id;
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
     * @param string $checkfullname etsitäänkö merkkijonon osilla, täsmällisellä merkkijonolla, vai ensimmäisellä kirjaimella
     *
     */
    public function OutputSongTitles($title, $checkfullname="no", $by="title"){
        switch($checkfullname){
            case "yes": 
                //Jos kyseessä Jumalan karitsa tai pyhä-hymnit, hae eri taulusta
                $from = ($by=="id" ? "liturgicalsongs" : "songdata");
                $this->titleslist = $this->con->q("SELECT title FROM $from WHERE $by = :giventitle ORDER by title",Array("giventitle"=>$title),"all_flat");
                break;
            case "no":
                $this->titleslist = $this->con->q("SELECT title FROM songdata WHERE $by LIKE :giventitle ORDER by title",Array("giventitle"=>"%$title%"),"all_flat");
                break;
            case  "first-letter":
                $this->titleslist = $this->con->q("SELECT title FROM songdata WHERE $by LIKE :giventitle ORDER by title",Array("giventitle"=>"$title%"),"all_flat");
                break;
            case  "spans":
                $this->titleslist = $this->con->q("SELECT title FROM songdata WHERE title between :span1 AND :span2 ORDER by title",Array("span1"=>$this->firstspan,"span2"=>$this->lastspan),"all_flat");
                break;
        }
        echo json_encode($this->titleslist);
    }

    /**
     * Hakee laulun tarkat tiedot tietokannasta
     *
     * @param string $title laulun tarkka nimi
     *
     */
    public function OutputSongInfo($title, $by){
        $from = ($by=="id" ? "liturgicalsongs" : "songdata");
        var_dump($title);
        $row = $this->con->q("SELECT title, verses FROM $from WHERE $by = :giventitle ORDER by title",Array("giventitle"=>$title),"row");
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
    public function ProcessEditedLyrics($title, $verses, $by){
        $from = ($by=="id" ? "liturgicalsongs" : "songdata");
        $existingdata = $this->con->q("SELECT title FROM $from WHERE $by = :giventitle",Array("giventitle"=>$title),"row");
        if(!$existingdata)
           $this->con->q("INSERT INTO  songdata (title, verses) VALUES (:giventitle, :versedata)",Array("giventitle"=>$title, "versedata"=>$verses),"none");
        else
            $this->con->q("UPDATE $from SET verses = :versedata WHERE $by = :giventitle",Array("giventitle"=>$title, "versedata"=>$verses),"none");
    }

}

?>
