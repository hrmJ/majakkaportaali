<?php
/**
 *
 * Messukohtaisia sisältöjä lataava olio
 *
 */
class ServiceDataLoader{

    /**
     * @param string $path polku tietokantakonfiguraatioon
     * @param int $id haettavan segmentin id sisältötaulussa
     */
    public function __construct($path,$id){
        $this->id = $id;
        $this->con = new DbCon($path);
    }


    /**
     *
     * Tulostaa datan json-muodossa
     *
     */
    public function OutputData(){
        echo json_encode($this->data);
    }

    /**
     * Hakee kaikki eri luokat (= messun osiot), jotka tässä portaalissa ovat käytössä
     */
    function LoadSlideClasses(){
        $this->data =  $this->con->q("SELECT DISTINCT classname FROM styles WHERE classname <> :not_this", Array("not_this"=>"sample"),"all_flat");
    }


}

/**
 * Messujen tietojen lataaja
 */
class ServiceLoader extends ServiceDataLoader{


    /**
     * @param string $path polku tietokantakonfiguraatioon
     */
        public function __construct($path){
        parent::__construct($path);
        #$this->title = $title;
        $this->GetCurrentSeason();
    }


    /**
     * Hakee kaikkien nykyisessä messukaudessa olevien messujen päivämäärät
     **/
    function LoadServiceDates(){
        $data = $this->con->q("SELECT id, servicedate FROM services WHERE servicedate BETWEEN :startdate AND :enddate ORDER BY servicedate ",Array("startdate"=>$this->season["startdate"],"enddate"=>$this->season["enddate"]),"all");
        $this->data = Array();
        foreach($data as $val){
            $this->data[] = Array("date" => FormatDate($val["servicedate"]), "id" =>  $val["id"]);
        }
    }

    /**
     * Hakee kaikki eri vastuutyypit
     */
    function LoadResponsibilities(){
        $this->data =  $this->con->q("SELECT DISTINCT responsibility FROM responsibilities", Array(),"all_flat");
    }



    /**
     * Hakee kaikki vastuuhenkilöt nykyisestä messusta
     *
     * @param integer id käsiteltävän messun id
     *
     */
    function LoadResponsibles($id){
        $this->data =  $this->con->q("SELECT responsibility, responsible FROM responsibilities WHERE service_id = :sid", Array("sid"=>$id),"all");
    }

    /**
     *
     * Valitsee sen messukauden, joka on lähinnä nykyistä päivämäärää.
     * Yrittää ensin löytää kauden, jonka sisälle nykyinen päivä osuu.
     * Tämän jälkeen yrittää hakea ensimmäisen kauden tulevaisuudesta.
     * Jos tämäkin epäonnistuu, hakee lähimmän kauden menneisyydestä.
     *
     * 
     * @param DbCon $con yhteys tietokantaan
     *
     * @return  array  Taulukon, jossa on ilmaistu messukauden alku- ja loppupäivät.
     *
     */
    function GetCurrentSeason(){
        $date = date('Y-m-d');
        $season = $this->con->q("SELECT id, name, startdate, enddate FROM seasons WHERE startdate <=:date AND enddate >=:date ORDER BY startdate", Array("date"=>$date),"row");
        #Jos nykyinen pvm ei osu mihinkään kauteen
        if(!$season) #1: ota seuraava kausi tulevaisuudesta
            $season = $this->con->q("SELECT id, name, startdate, enddate FROM seasons WHERE startdate >=:date ORDER BY startdate", Array("date"=>$date),"row");
        if(!$season) #2: ota edellinen kausi menneisyydestä
            $season = $this->con->q("SELECT id, name, startdate, enddate FROM seasons WHERE enddate <=:date ORDER BY enddate DESC", Array("date"=>$date),"row");
        $this->season = $season;
        return $this;
    }



}



/**
 * Laulujen nimien ja sanojen lataaja
 */
class SongLoader extends ServiceDataLoader{

    /**
     * @param string $path polku tietokantakonfiguraatioon
     * @param string $testament ot / nt - kumpi testamentti
     */
        public function __construct($title,$path){
        $this->title = $title;
        parent::__construct($path);
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


/**
 *
 *
 */
class BibleLoader extends ServiceDataLoader{

    /**
     * @param string $path polku tietokantakonfiguraatioon
     * @param string $testament ot / nt - kumpi testamentti
     */
        public function __construct($testament,$path){
        $this->testament = "verses_{$testament}_fi";
        parent::__construct($path);
    }

    /**
     * Lataa kirjojen nimet ko. testamentissa
     */
    public function LoadBookNames(){
        $this->data = $this->con->q("SELECT DISTINCT book FROM {$this->testament} order by id",Array(),"all_flat");
    }

    /**
     * Lataa  lukujen määrä
     *
     * @param string $bookname kirja, jonka luvut ladataan
     *
     */
    public function LoadChapters($bookname){
        $this->data = $this->con->q("SELECT DISTINCT chapterno FROM {$this->testament} WHERE book = :bookname order by id",Array("bookname"=>$bookname),"all_flat");
    }

    /**
     * Lataa  jakeiden määrä
     *
     * @param string $bookname kirja, jonka luvut ladataan
     * @param string $chapterno luku, jonka jakeet ladataan
     *
     */
    public function LoadVerses($bookname, $chapterno){
        $this->data = $this->con->q("SELECT DISTINCT verseno FROM {$this->testament} WHERE book = :bookname and chapterno = :chapterno order by id",Array("bookname"=>$bookname,"chapterno"=>$chapterno),"all_flat");
    }

    /**
     * Lataa jakeet käyttäjän märittämältä väliltä
     *
     * @param array $start Taulukko muotoa (book,chapter,verse)
     * @param array $end Taulukko muotoa (book,chapter,verse)
     *
     */
    public function LoadBibleVerses($start, $end){
        $this->data = $this->con->q("SELECT content FROM {$this->testament} WHERE id BETWEEN 
                (SELECT id FROM {$this->testament} WHERE book = :startbook AND chapterno = :startchapter AND verseno = :startverse)
                AND
                (SELECT id FROM {$this->testament} WHERE book = :endbook AND chapterno = :endchapter AND verseno = :endverse)",
                Array("startbook"=>$start[0],"startchapter"=>$start[1],"startverse"=>$start[2],
                      "endbook"=>$end[0],"endchapter"=>$end[1],"endverse"=>$end[2]),"all_flat");
        return $this;
    }

}


/**
 * Infodiasisällön lataaja
 */
class InfoSegmentLoader extends ServiceDataLoader{

    /**
     * hakee kaikkien laulujen nimet tietokannasta ja tulostaa ne filtteröitynä
     * laulun nimen tai jonkin sen sisältämän merkkijonon mukaan.
     */
    public function LoadInfoSlide(){
        $this->data = $this->con->q("SELECT maintext,header,genheader,subgenheader FROM infosegments WHERE id = :slide_id",Array("slide_id"=>$this->id),"row");
    }

}


/**
 * Lauludiasisällön lataaja
 */
class SongSegmentLoader extends ServiceDataLoader{

    /**
     * hakee kaikkien laulujen nimet tietokannasta ja tulostaa ne filtteröitynä
     * laulun nimen tai jonkin sen sisältämän merkkijonon mukaan.
     */
    public function LoadSongSlide(){
        $this->data = $this->con->q("SELECT songdescription, restrictedto, singlename, multiname from songsegments WHERE id = :slide_id",Array("slide_id"=>$this->id),"row");
    }

}


?>
