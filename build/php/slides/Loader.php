<?php


namespace Portal\slides;

use Medoo\Medoo;
use PDO;


/**
 *
 * Sisältöä lataava olio
 *
 * @param string $html merkkijono, joka voidaan tulostaa ajax-datan syöttämiseksi suoraan html-muodossa
 *
 */
class Loader{

    protected $html = "";

    /**
     *
     * @param Medoo $con tietokantayhteys
     *
     */
    public function __construct(\Medoo\Medoo $con){
        $this->con = $con;
        return $this;
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
     *
     * Palauttaa datan html-muodossa
     *
     * @return string html-muotoinen data syötettäväksi sivulle.
     *
     */
    public function GetHtml(){
        return $this->html;
    }


}

?>



