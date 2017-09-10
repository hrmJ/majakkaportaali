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
        $this->content_id = $this->con->q($this->idquery,$this->segment_vals,"row");
        if(!$this->content_id){
            $this->InsertContent();
            $this->content_id = $this->con->q($this->idquery,$this->segment_vals,"row");
        }
    }

    /**
     * Syötä varsinainen sisältödia tietokantaan
     */
    public function InsertContent(){
    
    
    }

}

/**
 *
 * Infodian syöttävä olio
 *
 */
class InfoSegmentLoader extends ServiceStructureLoader{

    /**
     * @param string $path polku tietokantakonfiguraatioon
     * @param Array $postvals $_POST-taulukon arvot, joiden perusteella informaatio syötetään
     */
    public function __construct($path, $postvals){
        $this->con = new DbCon($path);
        $this->segment_vals = Array($postvals["maintext"],$postvals["header"],$postvals["genheader"],$postvals["subgenheader"]);
        $this->idquery = "SELECT id FROM infosegments WHERE  maintext = ? AND  header = ? AND  genheader = ? AND subgenheader = ?)";
        $this->insertquery = "INSERT INTO infosegments (maintext, header, genheader, subgenheader) values (?, ?, ?, ?)";
        $this->SetContentId();
    }

}

?>
