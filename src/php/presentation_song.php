<?php
/**
 *
 * Diaesityksessä käytettävien laulujen Template
 *
 */
class PresentationSong extends Template{


    /**
     *
     * @param string $path polku templates-kansioon
     * @param string $title laulun nimi (id parempi?)
     *
     */
    public function __construct($path, $title){
        $this->path = $path;
        $this->title = $title;
        $this->con = new DbCon("$this->path/../../config.ini");
        $this->file = "$path/pres_song.tpl";
        $this->LoadData();
    }

    /**
     *
     * Lataa laulun otsikko, metadata ja sanat tietokannasta
     *
     */
    public function LoadData(){
        $this->songdata = $this->con->q("SELECT title, composer, lyrics, verses FROM songdata WHERE title = :title",Array("title"=>$this->title),"row");
    }

    /**
     *
     * Luo jokaisesta säkeistöstä (tai muusta jaottelusta) oma diansa
     *
     * @return string  
     *
     */
    public function SetVerses(){
        $verses = "";

        foreach(preg_split("/(\\r|\\n){2,}/", $this->songdata["verses"]) as $verse){
            $tpl = new Template("{$this->path}/pres_verse.tpl");
            $verses .= $tpl->Set("versetext",$verse)->Output();
        }

        return $verses;
    }

}

?>
