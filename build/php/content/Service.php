<?php
/**
 *
 * Yhtä messua / palvelusta / tapahtumaa koskevat tiedot
 *
 */


namespace Portal\content;

use Medoo\Medoo;
use PDO;


/**
 *
 * Yksi messu / palvelus 
 *
 */
class Service{

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

    /*
     * Hakee messun teeman
     *
     */
    public function GetTheme(){
        return $this->con->get("services","theme",["id" => $this->id]);
    }

    /*
     * Hakee messuun tarvittavat vastuuroolit ja niissä toimivat ihmiset
     *
     */
    public function GetResponsibles(){
        return $this->con->select("responsibilities",["responsibility","responsible"],["service_id" => $this->id]);
    }

    /**
     *
     * Tallentaa muutokset messun vastuunkantajiin
     *
     */
    public function SaveResponsibles($data){
        foreach($data as $responsibility=>$responsible){
            $this->con->update("responsibilities",
                [$responsibility => $responsible],
                ["service_id" => $this->id]);
        }
        return $this;
    }

}



?>
