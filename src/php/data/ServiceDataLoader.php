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

    /**
     *
     * Hakee messuun kaikki siihen määritellyt
     * esityselementit ja luo siten esityskokonaisuuden.
     *
     **/
    function LoadAllSegments(){
        $this->FetchSlotInformation();
        //foreach($this->slots as $key => $slot){
        //    switch($slot["slot_type"]){
        //        case "songsegment":
        //            $this->AddSongSegment($slot, $key);
        //            break;
        //        case "infosegment":
        //            $this->AddInfoSegment($slot, $key);
        //            break;
        //    }
        //} 
        return $this;
    }

    /**
     *
     * Hakee tietokannasta kaikki esityksen rakenne-elementtien
     * yleistiedot
     *
     */
    public function FetchSlotInformation(){
        $slot_query  = "SELECT id, slot_name, slot_type, slot_number, content_id, addedclass, header_id";
        //Kokeile, onko tätä kyseistä messua varten muutettu messurakennetta
        $this->slots = $this->con->select("ser")
        $this->slots = $this->con->q("$slot_query FROM service_specific_presentation_structure
            WHERE service_id = :sid ORDER by slot_number", Array("sid"=>$this->id),"all");
        if(!$this->slots){
            //Jos ei, käytä yleistä rakennetta
            $this->slots = $this->con->q("$slot_query FROM presentation_structure 
                ORDER by slot_number", Array(),"all");
        }
        return $this;
    }
    /**
     *
     * Lisää esitykseen laulusegmentin: tämä voi olla yksittäinen laulu (esim. Alkulaulu)
     * tai laulujen sarja (Ylistyslaulut, Rukouslaulut tms.)
     *
     * @param Array $slot segmentin yleistiedot
     * @param Array $slide_idx segmentin järjestysnumero
     *
     */
    public function AddSongSegment($slot, $slide_idx){
        $details = $this->con->q("SELECT id, songdescription,
            restrictedto, singlename, multiname FROM songsegments 
            WHERE id = :cid", Array("cid"=>$slot["content_id"]),"row");
        $titles = $this->con->q("SELECT song_title FROM servicesongs 
            WHERE service_id = :id AND songtype = :stype 
            ORDER BY multisong_position",
            Array("id"=>$this->id,"stype"=>$details["singlename"]),"all_flat");
        $song_idx = 0;
        foreach($titles as $title){
            //Käydään läpi kaikki tähän laulusarjaan kuluvat laulut
            $songdata = $this->con->q("SELECT title, composer, lyrics, verses FROM songdata 
                                       WHERE title = :title",
                                       Array("title"=>$title),"row");
            //Lisätään kukin laulu omana dia(sarja)naan
            $this->AddSlide(new Song($this->templatepath, $songdata), 
                $slot["addedclass"], $slot["header_id"], $slide_idx + $song_idx);
            $song_idx++;
        }
        return $this;
    }
    /**
     *
     * Lisää esitykseen infosegmentin: tämä voi olla yksittäinen otsikkodia,
     * tekstiä ja kuvaa sisältävä dia tms.
     *
     * @param Array $slot segmentin yleistiedot
     * @param Array $slide_idx segmentin järjestysnumero
     *
     */
    public function AddInfoSegment($slot, $slide_idx){
        $details = $this->con->q("SELECT id, maintext, header,
            genheader, subgenheader, imgname, imgposition FROM
            infosegments WHERE id = :cid",
            Array("cid"=>$slot["content_id"]),"row");
        $this->AddSlide(new Infoslide($this->templatepath, $details, $slot["slot_name"]),
            $slot["addedclass"], $slot["header_id"], $slide_idx);
        return $this;
    }


}




?>
