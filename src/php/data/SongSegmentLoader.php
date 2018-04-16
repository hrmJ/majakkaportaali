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
 * Lauludiasisällön lataaja
 */
class SongSegmentLoader extends ServiceDataLoader{

    /**
     * Hakee tietokannasta id:n perusteella dian tiedot
     */
    public function LoadSongSlide(){
        $this->data = $this->con->q("SELECT songdescription, restrictedto, singlename, multiname from songsegments WHERE id = :slide_id",Array("slide_id"=>$this->id),"row");
    }

}









?>
