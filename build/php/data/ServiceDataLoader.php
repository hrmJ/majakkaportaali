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
 * Messukohtaisia sisältöjä lataava olio
 *
 */
class ServiceDataLoader{

    /**
     * @param con Medoo-Tietokantayhteys
     * @param int $id haettavan segmentin id sisältötaulussa
     */
    public function __construct(\Medoo\Medoo $con, $id=Null){
        $this->id = $id;
        $this->con = $con;
    }


    /**
     *
     * Tulostaa datan json-muodossa
     *
     */
    public function OutputData(){
        echo json_encode($this->data);
    }

    /**
     * Hakee kaikki eri luokat (= messun osiot), jotka tässä portaalissa ovat käytössä
     */
    function LoadSlideClasses(){
        $this->data =  $this->con->q("SELECT DISTINCT classname FROM styles WHERE classname <> :not_this", Array("not_this"=>"sample"),"all_flat");
    }

    /**
     * Hakee kaikki tietokantaan tallennetut ylätunnisteet.
     * Hakee erikseen nimet ja 
     *
     */
    function LoadSlideHeaders(){
        $this->data = $this->con->q("SELECT id, template_name, maintext, imgname, imgposition, is_aside FROM headers", Array(), "all");
    }



}




?>
