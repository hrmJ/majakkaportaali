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
 * Laulusegmentin syöttävä olio
 *
 * @param $table sisältötyypin mukaisen sql-taulun nimi
 * @param $content_type sisältötyypin nimi presentation_structure-taulussa
 *
 */
class SongSegmentSaver extends ServiceStructureLoader{


    protected $table = "songsegments";
    protected $content_type = "songsegment";


    /**
     * @param Medoo $con Medoo-tietokantayhteys
     * @param Array $postvals $_POST-taulukon arvot, joiden perusteella informaatio syötetään
     */
    public function __construct($con, $postvals){
        parent::__construct($con, $postvals);
        $this->segment_vals = [
            "songdescription"=>$postvals["description"],
            "restrictedto"=>$postvals["restricted_to"],
            "singlename"=>$this->slot_name,
            "multiname"=>$postvals["multiname"]];
    }


}



?>
