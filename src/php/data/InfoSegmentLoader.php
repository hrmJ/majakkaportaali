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
 * Infodiasisällön lataaja
 */
class InfoSegmentLoader extends ServiceDataLoader{

    /**
     * Hakee tietokannasta id:n perusteella dian tiedot
     */
    public function LoadInfoSlide(){
        $this->data = $this->con->q("SELECT maintext,header,genheader,subgenheader, imgname, imgposition FROM infosegments WHERE id = :slide_id",Array("slide_id"=>$this->id),"row");
    }

}







?>
