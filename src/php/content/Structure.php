<?php


namespace Portal\content;

use Medoo\Medoo;
use PDO;


/**
 *
 * Messujen oletusrakenteen määritteleminen
 *
 */
class Structure{

    /**
     *
     * @param Medoo $con tietokantayhteys
     * @param integer $id messun id
     *
     */
    protected $con;
    public $id;

    /*
     *
     *
     */
    public function __construct(\Medoo\Medoo $con, $id){
        $this->con = $con;
        $this->id = $id;
    }

}



?>
