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
 *
 */
class SongData{

    /**
     *
     * @param SongCon $con yhteys tietokantaan
     *
     */
    public function __construct($con){
        $this->con = $con;
    }

    /**
     * Hakee kaikkien laulujen nimet tietokannasta.
     *
     */
    public function FetchListOfTitles(){
        $this->titleslist = $this->con->q("SELECT title FROM songdata ORDER by title",Array(),"all_flat");
    }

    /**
     * Tulostaa laulujen
     */
    public function OutputSongTitles(){
        if(!isset($this->titleslist))
            $this->FetchListOfTitles();
        echo json_encode($this->titleslist);
    }

}

?>
