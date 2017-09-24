<?php
/**
 *
 * Messun rakenteen syöttävä olio
 *
 */
class ServiceStructureLoader{

    /**
     * Hae sisältötyyppiä vastaavasta taulusta sen segmentin id, joka vastaa nyt syötettävää sisältöä.
     * Jos ei ole vanhastaan, syötä segmentti.
     */
    public function SetContentId(){
        $this->content_id = $this->con->q($this->idquery,$this->segment_vals,"column");
        if(!$this->content_id){
            $this->con->q($this->insertquery, $this->insert_vals,"none");
            $this->content_id = $this->con->q("SELECT max(id) FROM {$this->table}",Array(),"column");
        }
        return $this;
    }

    /**
     * Luo messun rakennetaulukkoon linkki sisältöön.
     */
    public function SetSlotData(){
        $this->con->q("DELETE FROM presentation_structure WHERE slot_number = :no",Array("no"=>$this->slot_number),"none");
        $this->con->q("INSERT INTO presentation_structure (content_id, slot_number, slot_type, slot_name) VALUES (:cid,:sno,:ctype,:sname)",Array("cid"=>$this->content_id,"sno"=>$this->slot_number,"ctype"=>$this->content_type,"sname"=>$this->slot_name),"none");
        return $this;
    }

}


/**
 *
 * Laulusegmentin syöttävä olio
 *
 */
class SongSegmentSaver extends ServiceStructureLoader{

    /**
     * @param string $path polku config.ini-tiedostoon
     * @param Array $postvals $_POST-taulukon arvot, joiden perusteella informaatio syötetään
     */
    public function __construct($path, $postvals){
        $this->con = new DbCon($path);
        $this->slot_number = $postvals["slot_number"];
        $this->slot_name = $postvals["slot_name"];
        $this->content_type = $postvals["slideclass"];
        $this->table = "{$postvals["slideclass"]}s";
        $this->segment_vals = Array("sname"=>$this->slot_name);
        $this->insert_vals = Array("desc"=>$postvals["description"],"restr"=>$postvals["restricted_to"],"sname"=>$this->slot_name,"mname"=>$postvals["multiname"]);
        $this->idquery = "SELECT id FROM songsegments WHERE singlename  = :sname LIMIT 1";
        $this->insertquery = "INSERT INTO songsegments (songdescription, restrictedto, singlename, multiname) values (:desc, :restr, :sname, :mname)";
    }


}

/**
 *
 * Infodian syöttävä olio
 *
 */
class InfoSegmentSaver extends ServiceStructureLoader{

    /**
     * @param string $path polku config.ini-tiedostoon
     * @param Array $postvals $_POST-taulukon arvot, joiden perusteella informaatio syötetään
     */
    public function __construct($path, $postvals){
        $this->con = new DbCon($path);
        $this->slot_number = $postvals["slot_number"];
        $this->slot_name = $postvals["slot_name"];
        $this->content_type = $postvals["slideclass"];
        $this->table = "{$postvals["slideclass"]}s";
        $this->segment_vals = Array("mt"=>$postvals["maintext"],"h"=>$postvals["header"],"gh"=>$postvals["genheader"],"sgh"=>$postvals["subgenheader"]);
        $this->insert_vals = $this->segment_vals;
        $this->idquery = "SELECT id FROM infosegments WHERE  maintext = :mt AND  header = :h AND  genheader = :gh AND subgenheader = :sgh";
        $this->insertquery = "INSERT INTO infosegments (maintext, header, genheader, subgenheader) values (:mt, :h, :gh, :sgh)";
    }


}

?>
