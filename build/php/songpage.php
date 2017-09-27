<?php

/**
 *
 * Laulujen syöttösivun template.
 *
 * @param string $type mistä sivutyypistä on kyse.
 *
 */
class SongPage extends Page{

    public $type = "songlist";

    /**
     *
     * @param string $path polku templates-kansioon
     * @param string $id sen messun id, jonka lauluja käsitellään
     *
     */
    public function __construct($path, $id){
        $this->path = $path;
        $this->id = $id;
        $this->multisongsdata = Array("ws", "com");
        $this->multisongtargets = Array("ws"=>"worshipsongs", "com"=>"communionsongs");
        parent::__construct();
    }

    /**
     *
     * Hae yksittäisten laulujen data tai oleta tyhjät, jos dataa ei löydy.
     * Syötä sen jälkeen arvojen perusteella rakennettu html-esitys datasta
     * varsinaiseen sivupohjaan.
     *
     */
    public function SetSingleSongs(){
        $this->singlesongsdata = Array($this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'alkulaulu'",Array("sid"=>$this->id),"row"),
                                 $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'paivanlaulu'",Array("sid"=>$this->id),"row"),
                                 $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'loppulaulu'",Array("sid"=>$this->id),"row"));
        $songtypes = Array("alkulaulu","paivanlaulu","loppulaulu");
        foreach($this->singlesongsdata as $key=> $song){
            if(!$song){
                $this->singlesongsdata[$key] = Array("song_title"=>"","songtype"=>$songtypes[$key]);
            }

        }
        $this->SetDataTable($this->singlesongsdata, "singlesongs");
        return $this;
    }

    /**
     *
     * Hae ylistyslaulujen data
     * tai oleta tyhjät, jos dataa ei löydy.
     *
     * @param Array $types Taulukko, joka kertoo, mistä lauluista on kyse (ylistys- vai ehtoollis-)
     *
     */
    public function SetMultiSongs($types){
        foreach($types as $type){
            $this->multisongsdata[$type] = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = :type ",Array("sid"=>$this->id, "type"=>$type));
            if(sizeof($this->multisongsdata[$type])==0)
                $this->multisongsdata[$type] = Array(Array("song_title"=>"","songtype"=>$type));
            $this->SetDataTable($this->multisongsdata[$type], $this->multisongtargets[$type]);
        }
        return $this;
    }

    /**
     *
     * Lataa laulujen lista -näkymään aakkosellisen listan
     * mukainen select-elementti ym.
     *
     */
    public function SetSongViewElements(){
        $screenlimit = 50;
        $alphabets = $this->con->q("SELECT ch FROM (SELECT DISTINCT substring(title FROM 1 FOR 1) as ch FROM songdata) as ll WHERE ch <> ' ' ORDER BY ch",Array(),"all_flat");
        $alphabets_processed = Array();
        foreach($alphabets as $idx=>$letter){
            $letter_items = $this->con->q("SELECT title FROM songdata WHERE title LIKE :thisletter  ORDER BY title",Array("thisletter"=>"$letter%"),"all_flat");
            $chunks = array_chunk($letter_items, $screenlimit);
            if(sizeof($chunks)==1){
                $alphabets_processed[$letter] = $letter;
            }
            else{
                $alphabets_processed[$letter] = Array();
                foreach($chunks as $chunk){
                    $alphabets_processed[$letter][] = "<span>$chunk[0]</span> - <span>{$chunk[sizeof($chunk)-1]}</span>";
                }
            }
        }
        $menu = new UiMenu($this->path, $alphabets_processed);
        $menu->Set("defaulttext","Selaa lauluja alkukirjaimen perusteella")->Set("id","alpha-select");
        $this->Set("alphaselect",$menu->Output());
        return $this;
    }


    /**
     *
     * Hakee tietokannasta, mitkä laulut on merkitty Jumalan karitsa- tai Pyhä-versioiksi.
     * tulostaa select-elementit näiden valitsemista varten
     *
     * @param Array $roles Se, mitä liturgisten laulujen tyyppejä messussa on käytössä
     *
     */
    public function SetLiturgicalSongs($roles){
        foreach($roles as $role){
            $texts = $this->con->q("SELECT CONCAT(title, titleseparator) FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>$role),"all");
            $ids = $this->con->q("SELECT id FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>$role),"all_flat");
            $select = new Select($this->path, $texts, "Valitse versio", "Valitse versio", $role . "_select", $valuedata=$ids);
            $this->Set("{$role}_menu", $select->Output());
        }
    }

    /**
     * Lataa tietokannasta kaikki messussa käytössä olevat laulutyypit (määritelty service_structure.php-sivulla)
     *
     */
    public function LoadSongTypes(){
        $allsongtypes = "";
        $slots = $this->con->q("SELECT slot_name, content_id FROM presentation_structure WHERE slot_type = :st ORDER by slot_number ",Array("st"=>"songsegment"),"all");
        foreach($slots as $slot){
            $details = $this->con->q("SELECT id, songdescription, restrictedto, singlename, multiname FROM songsegments WHERE id = :cid",Array("cid"=>$slot["content_id"]),"row");
            $multi = ($details["multiname"] == "" ? false: true);
            if($multi){
                $output = new Template("{$this->path}/multisong.tpl");
                $output->Set("multisongheader",$details["multiname"]);
            }
            else{
                $output = new Template("{$this->path}/singlesong.tpl");
            }
            $output->Set("category",$slot["slot_name"])->Set("name","")->Set("value","");
            $allsongtypes.=$output->Output();
        }
        $this->Set("songs",$allsongtypes);

    }



}

?>
