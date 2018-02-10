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
            $this->con->q($this->insertquery, $this->insert_query_vals,"none");
            $this->content_id = $this->con->q("SELECT max(id) FROM {$this->table}",Array(),"column");
        }
        else{
            $this->update_query_vals["thisid"] = $this->content_id;
            $this->con->q($this->updatequery, $this->update_query_vals,"none");
        }
        return $this;
    }

    /**
     * Luo messun rakennetaulukkoon linkki sisältöön.
     */
    public function SetSlotData(){
        $this->con->q("DELETE FROM presentation_structure WHERE slot_number = :no",Array("no"=>$this->slot_number),"none");
        $this->con->q("INSERT INTO presentation_structure (content_id, slot_number, slot_type, slot_name, addedclass, header_id) VALUES (:cid,:sno,:ctype,:sname, :aclass, :headerid)",Array("cid"=>$this->content_id,"sno"=>$this->slot_number,"ctype"=>$this->content_type,"sname"=>$this->slot_name,"aclass"=>$this->addedclass,"headerid"=>$_POST["header_id"]),"none");
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
        $this->addedclass = $postvals["addedclass"];
        $this->segment_vals = Array("desc"=>$postvals["description"],"restr"=>$postvals["restricted_to"],"sname"=>$this->slot_name,"mname"=>$postvals["multiname"]);
        $this->insert_query_vals  = $this->segment_vals;
        $this->update_query_vals  = $this->segment_vals;
        $this->idquery = "SELECT id FROM songsegments WHERE singlename  = :sname and multiname = :mname and songdescription = :desc and restrictedto = :restr LIMIT 1";
        $this->insertquery = "INSERT INTO songsegments (songdescription, restrictedto, singlename, multiname) values (:desc, :restr, :sname, :mname)";
        $this->updatequery = "UPDATE songsegments SET songdescription = :desc, restrictedto = :restr, singlename = :sname, multiname=:mname WHERE id = :thisid";
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
        $this->addedclass = $postvals["addedclass"];
        $this->table = "{$postvals["slideclass"]}s";
        $this->imgname = $postvals["imgname"];
        $this->imgpos = $postvals["imgpos"];
        if($_POST["imgname"]=="Ei kuvaa"){
            $this->imgname = "";
            $this->imgpos = "";
        }
        $this->segment_vals = Array("mt"=>$postvals["maintext"],"h"=>$postvals["header"],"gh"=>$postvals["genheader"],"sgh"=>$postvals["subgenheader"]);
        $this->insert_query_vals = Array("mt"=>$postvals["maintext"],"h"=>$postvals["header"],"gh"=>$postvals["genheader"],"sgh"=>$postvals["subgenheader"], "imgname"=>$this->imgname, "imgpos"=>$this->imgpos);
        $this->update_query_vals = $this->insert_query_vals;

        $this->idquery = "SELECT id FROM infosegments WHERE  maintext = :mt AND  header = :h AND  genheader = :gh AND subgenheader = :sgh";
        $this->insertquery = "INSERT INTO infosegments (maintext, header, genheader, subgenheader, imgname, imgposition) values (:mt, :h, :gh, :sgh, :imgname, :imgpos)";
        $this->updatequery = "UPDATE infosegments set maintext = :mt, header = :h, genheader = :gh, subgenheader = :sgh, imgname = :imgname,  imgposition = :imgpos WHERE id = :thisid";
    }


}

?>
