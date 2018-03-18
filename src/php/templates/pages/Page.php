<?php
/**
 *
 * Sivupohjat (perivät template-luokasta)
 *
 */

namespace Portal\templates\pages;

use Portal\templates\Template;
use Portal\utilities\SongCon;

/**
 *
 * Kokonaisten sivujen (laululista, messulista jne.) template.
 *
 */
class Page extends Template{

    public function __construct(){
        parent::__construct("{$this->path}/{$this->type}.tpl");
        $this->layout = new Template("{$this->path}/layout.tpl");
        $byline = "";
        $title = "";
        $bodyclass = "";
        switch($this->type){
            case "songlist":
                $this->con = new SongCon("$this->path/../../config.ini");
                $bodyclass = "songs";
                $title = "Laulut majakkamessuun xx. (Bändinä x)";
                $byline = "<h2>Messun laulut</h2>";
                break;
            case "service_structure":
                $this->con = new DbCon("$this->path/../../config.ini");
                $byline = "<h2>Messun rakenne</h2>";
                $bodyclass = "service_structure";
                break;
            case "servicelist":
                $this->con = new ServiceListCon("$this->path/../../config.ini");
                $byline = "Majakkamessut kaudelle x";
                $bodyclass = "servicelist";
                break;
            case "servicedetails":
                $this->con = new ServiceDetailsCon("$this->path/../../config.ini");
                $this->servicemeta = $this->con->q("SELECT theme, servicedate FROM services WHERE id = :id",Array("id"=>$this->id),"row");
                $this->servicemeta["servicedate"] = FormatDate($this->servicemeta['servicedate']);
                $byline = "Majakkamessu {$this->servicemeta['servicedate']}";
                $title = "{$byline}: {$this->servicemeta['theme']}";
                $this->Set("theme", $this->servicemeta['theme']);
                $bodyclass = "servicedetails";
                break;
        }
        $this->layout->Set("title", $title);
        $this->layout->Set("byline", $byline);
        $this->layout->Set("bodyclass", $bodyclass);
    }

    /**
     *
     * Luo html-esityksen sivulla näytettävästä datasta ja liittää sen 
     * osaksi sivun omaa pohjaa.
     *
     * @param Array $data tietokantadata, jota taulukko kuvaa.
     * @param string $target kohta templatesta, johon data syötetään.
     *
     */
    public function SetDataTable($data, $target){
        switch($this->type){
            case "songlist":
                $dt = new SongDataTable($this->path, $data);
                break;
        }
        $this->Set($target,$dt->Output());
    }

    /**
     *
     * Hakee messu-id:n, jos sitä ei ole asetettu.
     *
     * @return int päivämäärältään lähimmän messun id.
     *
     */
    public function GetIdByDate($date){
        //Pyri ensiksi löytämään lähin sunnuntai tulevaisuudesta
        $id = $this->con->q("SELECT id FROM services WHERE servicedate >= :today ORDER BY servicedate",Array("today"=>$date), "column");
        //Jos ei löydy, ota lähin menneisyydestä
        $id = ($id ? $id: $con->q("SELECT id FROM services WHERE servicedate < :today ORDER BY servicedate DESC",Array("today"=>$date), "column"));
        return $id;
    }

    /**
     *
     * Liittää sivun layout-pohjaan ja palauttaa lopputuloksen.
     *
     * @return string Kokonainen html-sivu merkkijonona
     *
     */
    public function OutputPage(){
        $this->layout->Set("content",$this->Output());
        return $this->layout->Output();

    }

}

?>

