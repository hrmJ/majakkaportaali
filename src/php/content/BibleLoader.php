<?php

namespace Portal\content;


use Medoo\Medoo;
use PDO;

/**
 * Lataa raamatuntekstejä ja jakeiden osoitteita tietokannasta.
 *
 * @param $data lataajan tuottama data taulukkona
 *
 */
class BibleLoader{

    private $data = [];

    /**
     *
     * Palauttaa kerätyn datan
     *
     */
    public function GetData(){
        return $this->data;
    }

    /**
     * @param string $path polku tietokantakonfiguraatioon
     * @param string $testament ot / nt - kumpi testamentti
     */
        public function __construct($testament, \Medoo\Medoo $con){
        $this->con = $con;
        $this->testament = "verses_{$testament}_fi";
    }

    /**
     * Lataa kirjojen nimet ko. testamentissa
     */
    public function LoadBookNames(){
        $this->data = [];
        $data = $this->con->query("SELECT DISTINCT q.book FROM
            (SELECT  book, id FROM {$this->testament} order by id) 
            as q")->fetchAll();
        foreach($data as $row){
            $this->data[] = $row["book"];
        }
        return $this;
    }

    /**
     * Lataa  lukujen määrä
     *
     * @param string $bookname kirja, jonka luvut ladataan
     *
     */
    public function LoadChapters($bookname){
        $this->data = [];
        $data = $this->con->query("SELECT DISTINCT 
            q.chapterno FROM
            (SELECT chapterno, id FROM {$this->testament} 
            WHERE book = :bookname 
            order by id) as q",
            ["bookname"=>$bookname])->fetchAll();
        foreach($data as $row){
            $this->data[] = $row["chapterno"];
        }
        return $this;
    }

    /**
     * Lataa  jakeiden määrä
     *
     * @param string $bookname kirja, jonka luvut ladataan
     * @param string $chapterno luku, jonka jakeet ladataan
     *
     */
    public function LoadVerses($bookname, $chapterno){
        $this->data = [];
        $data = $this->con->query("SELECT DISTINCT q.verseno FROM
            (SELECT verseno, id from {$this->testament} 
            WHERE book = :bookname and chapterno = :chapterno 
            order by id) as q",
            ["bookname"=>$bookname,"chapterno"=>$chapterno])->fetchAll();
        foreach($data as $row){
            $this->data[] = $row["verseno"];
        }
        return $this;
    }

    /**
     * Lataa jakeet käyttäjän märittämältä väliltä
     *
     * @param array $start Taulukko muotoa (book,chapter,verse)
     * @param array $end Taulukko muotoa (book,chapter,verse)
     *
     */
    public function LoadVerseContent($start, $end=null){
        $end = ($end ? $end : $start);
        $this->data = [];
        $data = $this->con->query("SELECT content FROM {$this->testament} 
                WHERE id BETWEEN 
                    (SELECT id FROM {$this->testament} 
                        WHERE book = :startbook AND 
                              chapterno = :startchapter AND 
                               verseno = :startverse)
                AND
                    (SELECT id FROM {$this->testament}
                         WHERE book = :endbook AND 
                                chapterno = :endchapter AND 
                                verseno = :endverse)",
                ["startbook"=>$start[0],"startchapter"=>$start[1],"startverse"=>$start[2],
                      "endbook"=>$end[0],"endchapter"=>$end[1],"endverse"=>$end[2]])->fetchAll();

        foreach($data as $row){
            $this->data[] = $row["content"];
        }

        return $this;
    }

}

?>
