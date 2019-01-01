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
    public $finnish_booknames = ["nt" => [
        'Matt', 'Mark', 'Luuk', 'Joh', 'Apt', 'Room', '1Kor', '2Kor', 
        'Gal', 'Ef', 'Fil', 'Kol', '1Tess', '2Tess', '1Tim', '2Tim', 
        'Tit', 'Filem', 'Hepr', 'Jaak', '1Piet', '2Piet', '1Joh', 
        '2Joh', '3Joh', 'Juud', 'Ilm'],
        "ot" => 
        ['1Moos', '2Moos', '3Moos', '4Moos', '5Moos', 'Joos', 'Tuom',
        'Ruut', '1Sam', '2Sam', '1Kun', '2Kun', '1Aik', '2Aik', 'Esra', 'Neh',
        'Est', 'Job', 'Ps', 'Sananl', 'Saarn', 'Laull', 'Jes', 'Jer', 'Valit',
        'Hes', 'Dan', 'Hoos', 'Joel', 'Aam', 'Ob', 'Joona', 'Miika', 'Nah',
        'Hab', 'Sef', 'Hagg', 'Sak', 'Mal' ]
        ];
    public $english_booknames = ["nt" => 
        ["Matt", "Mark", "Luke", "John",
        "Acts", "Rom ", "1Cor", "2Cor", "Gal ", "Eph", "Phil", "Col",
        "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas",
        "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"],
        "ot" => 
        [ "Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth",
            "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job",
            "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos",
            "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech",
            "Mal" ]
        ];

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
     * @param array $start Taulukko muotoa [book, chapter, verse]
     * @param array $end Taulukko muotoa [book, chapter, verse]
     *
     */
    public function LoadVerseContent($start, $end=null){
        $end = ($end ? $end : $start);
        $this->data = [];
        $cond = ["startbook"=>$start[0],"startchapter"=>$start[1],"startverse"=>$start[2],
                      "endbook"=>$end[0],"endchapter"=>$end[1],"endverse"=>$end[2]];
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
                $cond)->fetchAll();
        foreach($data as $row){
            $this->data[] = $row["content"];
        }

        return $this;
    }


    /**
     *
     * Muodosta kahden tai useamman jakeen kokonaisuuksia dioissa näyttämistä varten
     *
     * @param $group_size kuinka monta jaetta niputetaan
     *
     */
    public function GroupVerses($group_size=2){
        $grouped = [];
        $thisgroup = "";
        for($i = 0;$i<sizeof($this->data);$i++){
            $thisgroup .= ($thisgroup ? " <br><br> " . $this->data[$i] : $this->data[$i]);
            if (($i+1 )% $group_size == 0 and $i > 0) {
                $grouped[] = $thisgroup;
                $thisgroup  = "";
            }
        }
        //Parittomien viimeinen jae
        if(!in_array($thisgroup, $grouped)){
            $grouped[] =  $thisgroup;
        }
        if(!$grouped){
            //Yksijakeiset
            $grouped = [$thisgroup];
        }
        $this->data = $grouped;
        return $this;
    }

    /**
     *
     * Tulostaa raamatunkohdasta muotoillun osoiteviittauksen
     *
     * @param Array $start taulukko muotoa ["kirja","luku","jae"]
     * @param Array $end taulukko muotoa ["kirja","luku","jae"]
     *
     */
    public function GetHumanReadableAddress($start, $end){
        $testament = preg_replace("/verses_(..)_fi/", "$1", $this->testament);
        //$start[0] = $this->finnish_booknames[$testament][
        //    array_search($start[0], $this->english_booknames[$testament])
        //    ];
        //$end[0] = $this->finnish_booknames[$testament][
        //    array_search($end[0], $this->english_booknames[$testament])
        //    ];
        $addr = $start[0] . ' ' . $start[1];
        if($start[0] !== $end[0]){
            $addr .= ":" . $start[2] . " - " . $end[0] . " " . $end[1] . ": " . $end[2];
        }
        else if($start[1] == $end[1] && $start[2] == $end[2]) {
            $addr .= ":" . $start[2];
        }
        else if($start[1] == $end[1]) {
            $addr .= ":" . $start[2] . " - " .  $end[2];
        }
        else if($start[1] !== $end[1]) {
            $addr .= ":" . $start[2] . " - " .  $end[1] . ": " . $end[2];
        }
        return $addr;
    }

}

?>
