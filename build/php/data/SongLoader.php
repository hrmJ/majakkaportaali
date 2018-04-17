<?php
/**
 *
 * Messuja koskevan datan lataaminen ja muokkaaminen
 *
 */


namespace Portal\data;

use Medoo\Medoo;
use PDO;

/**
 * Laulujen nimien ja sanojen lataaja
 */
class SongLoader extends ServiceDataLoader{

    /**
     * @param con Medoo-Tietokantayhteys
     * @param string $testament ot / nt - kumpi testamentti
     */
    public function __construct($title,\Medoo\Medoo $con){
        $this->title = $title;
        parent::__construct($con);
    }

    /**
     * Hakee kaikkien laulujen nimet tietokannasta ja tulostaa ne filtteröitynä
     * laulun nimen tai jonkin sen sisältämän merkkijonon mukaan.
     */
    public function LoadTitles(){
        $this->data = $this->con->q("SELECT title FROM songdata WHERE title LIKE :giventitle ORDER by title",Array("giventitle"=>"%{$this->title}%"),"all_flat");
    }


    /**
     * Hakee laulun säkeistöt nimen perusteella.
     */
    public function LoadContent(){
        $row = $this->con->q("SELECT title, verses FROM songdata WHERE title = :giventitle ORDER by title",Array("giventitle"=>$this->title),"row");
        $this->data = Array("title"=>$row["title"],"verses"=>$row["verses"]);
    }

}




?>
