<?php
/**
 *
 * Yhtä portaalia käyttävää yhteisöä koskevat tiedot
 *
 */


namespace Portal\content;

use Medoo\Medoo;
use PDO;


/**
 *
 * Kommenttien lataamisen ja uuden kommentin lisäämisen 
 * hoitavat oliot
 *
 */
class Community{

    /**
     *
     * @param Medoo $con tietokantayhteys
     *
     */
    protected $con;

    /*
     *
     *
     */
    public function __construct(\Medoo\Medoo $con){
        $this->con = $con;
    }

    /**
     *
     * Hae kaikki käytössä olevat vastuutyypit ja palauta lista niistä
     *
     */
    public function GetListOfResponsibilities(){
        $available_responsibilities = $this->con->query("SELECT DISTINCT responsibility FROM responsibilities")
            ->fetchAll(PDO::FETCH_COLUMN);
        return $available_responsibilities;
    }

}



?>
