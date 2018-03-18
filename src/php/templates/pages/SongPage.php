<?php

namespace Portal\templates\pages;

use Portal\templates\pages\Page;

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
     * Hakee messu-id:n, jos sitä ei ole asetettu.
     *
     * @param DbCon $con yhteys tietokantaan
     *
     * @return int päivämäärältään lähimmän messun id.
     *
     */
    public function GetIdByDate($con, $date){
        //Pyri ensiksi löytämään lähin sunnuntai tulevaisuudesta
        $id = $con->q("SELECT id FROM services WHERE servicedate >= :today ORDER BY servicedate",Array("today"=>$date), "column");
        //Jos ei löydy, ota lähin menneisyydestä
        $id = ($id ? $id: $con->q("SELECT id FROM services WHERE servicedate < :today ORDER BY servicedate DESC",Array("today"=>$date), "column"));
        return $id;
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
     * Lataa tietokannasta kaikki messussa käytössä olevat laulutyypit
     * (määritelty service_structure.php-sivulla) ja syötä sivupohjaan
     * niiden mukaiset slotit lauluille.
     *
     */
    public function LoadSongTypes(){
        $allsongtypes = "";
        //Hae ensin kaikki lauluslotit rakenteesta (TODO: messukohtaisesti)
        $slots = $this->con->q("SELECT slot_name, content_id FROM presentation_structure WHERE slot_type = :st ORDER by slot_number ",Array("st"=>"songsegment"),"all");
        foreach($slots as $slot){
            //Hae jokaisen lauluslotin tarkemmat yksityiskohdat ja se, onko kyseessä monta laulua samasta tyypistä vai ainoastaan yksi laulu
            $this->details = $this->con->q("SELECT id, songdescription, restrictedto, singlename, multiname FROM songsegments WHERE id = :cid",Array("cid"=>$slot["content_id"]),"row");
            $multi = ($this->details["multiname"] == "" ? false: true);
            $restr = ($this->details["restrictedto"] == "" ? false: true);
            if($restr){
                $container = new Template("{$this->path}/restrictedsong.tpl");
                $container->Set("select",$this->CreateSongSelect());
            }
            else if($multi){
                $container = new Template("{$this->path}/multisong.tpl");
                $container->Set("multisongheader",$this->details["multiname"]);
                $titles = $this->con->q("SELECT song_title FROM servicesongs WHERE service_id = :id AND songtype = :stype ORDER BY multisong_position",Array("id"=>$this->id,"stype"=>$this->details["singlename"]),"all_flat");
                if(!$titles)
                    $titles = Array("");
                $songslots = "";
                foreach($titles as $title){
                    $output = new Template("{$this->path}/singlesong.tpl");
                    $output->Set("category",$slot["slot_name"])->Set("name","")->Set("value",$title)->Set("isparent","");
                    $songslots  .= "\n" . $output->Output();
                }
                $container->Set("songslots",$songslots);
            }
            else{
                $container = new Template("{$this->path}/singlesong.tpl");
                $title = $this->con->q("SELECT song_title FROM servicesongs WHERE service_id = :id AND songtype = :stype",Array("id"=>$this->id,"stype"=>$this->details["singlename"]),"column");
                if(!$title)
                    $title = "";
                $container->Set("value",$title)->Set("isparent","slot-parent");
            }
            $allsongtypes.= $container->Set("category",$slot["slot_name"])->Output();
        }
        $this->Set("songs",$allsongtypes);

        return $this;
    }

    /**
     *
     * Luo select-elementti, jolla valitaan rajatusta määrästä lauluja.
     *
     */
    public function CreateSongSelect(){
        $songs = explode(",", trim($this->details["restrictedto"]," ,"));
        foreach($songs as $idx=>$song){
            $songs[$idx]=trim($song);
        }
        $select = new Select($this->path,(array_merge(Array("Valitse","------------"),$songs,Array("Jokin muu"))));
        $select->SetClass("songinput");
        return $select->OutputSelect();
    }


}

?>
