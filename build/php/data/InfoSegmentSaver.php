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
 * Infodian syöttävä olio
 *
 * @param $table sisältötyypin mukaisen sql-taulun nimi
 * @param $content_type sisältötyypin nimi presentation_structure-taulussa
 *
 */
class InfoSegmentSaver extends ServiceStructureLoader{

    protected $table = "infosegments";
    protected $content_type = "infosegment";


    /**
     * @param Medoo $con Medoo-tietokantayhteys
     * @param Array $postvals $_POST-taulukon arvot, joiden perusteella informaatio syötetään
     */
    public function __construct($con, $postvals){
        parent::__construct($con, $postvals);
        $this->imgname = $postvals["imgname"];
        $this->imgpos = $postvals["imgpos"];
        if($postvals["imgname"]=="Ei kuvaa"){
            $this->imgname = "";
            $this->imgpos = "";
        }
        $this->segment_vals = [
            "maintext"=>$postvals["maintext"],
            "header"=>$postvals["header"],
            "genheader"=>$postvals["genheader"],
            "subgenheader"=>$postvals["subgenheader"]
        ];
    }


}







?>
