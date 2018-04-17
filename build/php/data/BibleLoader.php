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
 *
 *
 */
class BibleLoader extends ServiceDataLoader{

    /**
     * @param string $testament ot / nt - kumpi testamentti
     * @param Medoo $con tietokantayhteys
     */
        public function __construct($testament,\Medoo\Medoo $con){
        $this->testament = "verses_{$testament}_fi";
        parent::__construct($con);
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






?>
