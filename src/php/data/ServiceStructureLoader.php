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
 * Messun rakenteen syöttävä olio
 *
 */
class ServiceStructureLoader{

    /**
     * @param Medoo $con Medoo-tietokantayhteys
     * @param Array $postvals $_POST-taulukon arvot, joiden perusteella informaatio syötetään
     */
    public function __construct($con, $postvals){
        $this->con = $con;
        $this->slot_number = $postvals["slot_number"];
        $this->slot_name = $postvals["slot_name"];
        $this->addedclass = $postvals["addedclass"];
    }

    /**
     * Hae sisältötyyppiä vastaavasta taulusta sen segmentin id, joka vastaa nyt syötettävää sisältöä.
     * Jos ei ole vanhastaan, syötä segmentti.
     */
    public function SetContentId(){
        $this->content_id = $this->con->get($this->table, "id", $this->segment_vals);
        if(!$this->content_id){
            //Jos kokonan uusi segmentti, syötetään
            $this->con->insert($this->table, $this->segment_vals);
            $this->content_id = $this->con->max($this->table, "id");
        }
        else{
            //Jos olemassaoleva segmentti, päivitetään
            $this->con->update($this->table, $this->segment_vals, ["id"=>$this->content_id]);
        }
        return $this;
    }

    /**
     * Luo messun rakennetaulukkoon linkki sisältöön.
     */
    public function SetSlotData(){
        $this->con->delete("presentation_structure", ["slot_number" => $this->slot_number]);
        $this->con->insert("presentation_structure",
            ["content_id" => $this->content_id, 
             "slot_number" => $this->slot_number,
             "slot_type" => $this->content_type,
             "slot_name" => $this->slot_name,
             "addedclass" => $this->addedclass,
             "header_id" => (isset($_POST["header_id"]) ? $_POST["header_id"] : 0),
         ]);
        return $this;
    }

}







?>
