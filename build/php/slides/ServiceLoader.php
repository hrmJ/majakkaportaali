<?php


namespace Portal\slides;

use Medoo\Medoo;
use PDO;



/**
 * Messujen tietojen lataaja
 *
 * @param Array $injectables Messuun syötettävät yksittäiset tiedot assosiatiivisena taulukkona (esim. "juontaja" => "Maikki")
 *
 */
class ServiceLoader extends Loader{

    protected $injectables = Array();


    /**
     *
     *
     * @param Medoo $con tietokantayhteys
     *
     */
        public function __construct(\Medoo\Medoo $con){
        parent::__construct($con);
        #$this->title = $title;
        #$this->GetCurrentSeason();
    }


    /**
     *
     * Hakee messuun kaikki siihen määritellyt
     * esityselementit ja luo siten esityskokonaisuuden.
     *
     **/
    function LoadAllSegments(){
        $this->FetchSlotInformation();
        foreach($this->slots as $key => $slot){
            switch($slot["slot_type"]){
                case "songsegment":
                    $this->AddSongSegment($slot, $key);
                    break;
                case "infosegment":
                    $this->AddInfoSegment($slot, $key);
                    break;
            }
        } 
        return $this;
    }


    /**
     *
     * Syöttää messuun käyttäjän määrittelemän upotettavan datan, kuten juontajien nimet yms.
     * cf. https://stackoverflow.com/questions/963145/variable-scope-for-php-callback-functions#963163
     *
     **/
    function InjectData(){
        $this->html = preg_replace_callback("/{{([^}]+)}}/", array($this, 'InjectThisPieceOfData'), $this->html);
        return $this;
    }


    /**
     *
     * Suorittaa yksittäisen datansyöttämisen. Käytetään callback-funktiona replace-funktiolle
     * @param $matches preg_replace-funktion osumien lista. $m[0] = koko mätsi, 1 = eka backreference jne.
     *
     **/
    function InjectThisPieceOfData($matches){
        if (!array_key_exists($matches[1], $this->injectables)){
            //Jos ei vielä haettu tietokannasta tätä informaatiota
            switch($matches[1]){
                case "Messun aihe":
                    $value = $this->con->q("SELECT theme FROM services WHERE id = :id",
                        Array("id"=>$this->id),"column");
                    break;
                case "Messun päivämäärä":
                    $value = $this->con->q("SELECT servicedate FROM services WHERE id = :id",
                        Array("id"=>$this->id),"column");
                    break;
                default:
                    //JOs ei määritelty mitään spesifimpää, etsi vastuut-taulusta
                    $value = $this->con->q("SELECT responsible FROM responsibilities 
                        WHERE LOWER(responsibility) = :resp and service_id = :id",
                        Array("resp"=>strtolower($matches[1]),"id"=>$this->id),"column");
                    break;
            }
            $this->injectables[$matches[1]] = $value;
        }
        return $this->injectables[$matches[1]];
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


    /**
     *
     * Lisää esitykseen uuden dian
     *
     * @param Slide $slide Slide-olio, joka representoi lisättävä diaa (laulu, info, raamattu jne.)
     * @param string $addedclass dialle määritelty tyyliluokka
     * @param string $header_id dian ylätunnisteen id
     * @param Array $slide_idx segmentin järjestysnumero
     *
     */
    public function AddSlide($slide, $addedclass, $header_id, $slide_idx){
        $slide->SetAddedClass($addedclass)
              ->MarkIfFirst($slide_idx)
              ->SetDetails()
              ->SetPageHeader($header_id, $this->con);
        $this->html .= "{$slide->Output()}\n\n";
        return $this;
    }


    /**
     * Hakee kaikkien nykyisessä messukaudessa olevien messujen päivämäärät
     **/
    function LoadServiceDates(){
        $data = $this->con->q("SELECT id, servicedate FROM services WHERE servicedate BETWEEN :startdate AND :enddate ORDER BY servicedate ",Array("startdate"=>$this->season["startdate"],"enddate"=>$this->season["enddate"]),"all");
        $this->data = Array();
        foreach($data as $val){
            $this->data[] = Array("date" => FormatDate($val["servicedate"]), "id" =>  $val["id"]);
        }
    }


    /**
     * Hakee kaikki vastuuhenkilöt nykyisestä messusta (vain nopeaa esikatselua varten)
     *
     * @param integer id käsiteltävän messun id
     *
     **/
    function LoadResponsibles($id){
        $this->data =  $this->con->q("SELECT responsibility, responsible FROM responsibilities WHERE service_id = :sid", Array("sid"=>$id),"all");
    }

    /**
     * Hakee kaikki laulut nykyisestä messusta
     *
     * @param integer id käsiteltävän messun id
     *
     **/
    function LoadSongs($id){
        $this->data =  $this->con->q("SELECT song_title FROM servicesongs WHERE service_id = :sid ORDER by multisong_position, id", Array("sid"=>$id),"all_flat");
    }
    
    /**
     *
     * Valitsee sen messukauden, joka on lähinnä nykyistä päivämäärää.
     * Yrittää ensin löytää kauden, jonka sisälle nykyinen päivä osuu.
     * Tämän jälkeen yrittää hakea ensimmäisen kauden tulevaisuudesta.
     * Jos tämäkin epäonnistuu, hakee lähimmän kauden menneisyydestä.
     *
     * 
     * @param DbCon $con yhteys tietokantaan
     *
     * @return  array  Taulukon, jossa on ilmaistu messukauden alku- ja loppupäivät.
     *
     */
    function GetCurrentSeason(){
        $date = date('Y-m-d');
        $season = $this->con->q("SELECT id, name, startdate, enddate FROM seasons WHERE startdate <=:date AND enddate >=:date ORDER BY startdate", Array("date"=>$date),"row");
        #Jos nykyinen pvm ei osu mihinkään kauteen
        if(!$season) #1: ota seuraava kausi tulevaisuudesta
            $season = $this->con->q("SELECT id, name, startdate, enddate FROM seasons WHERE startdate >=:date ORDER BY startdate", Array("date"=>$date),"row");
        if(!$season) #2: ota edellinen kausi menneisyydestä
            $season = $this->con->q("SELECT id, name, startdate, enddate FROM seasons WHERE enddate <=:date ORDER BY enddate DESC", Array("date"=>$date),"row");
        $this->season = $season;
        return $this;
    }


    /**
     *
     * Aseta polku templates-kansioon
     *
     * @param string $path polku templates-kansioon
     *
     */
    public function SetTemplatePath($path){
        $this->templatepath = $path;
        return $this;
    }

    /**
     *
     * Aseta messun id
     * @param int $id  sen messun id, jota käsitellään
     *
     */
    public function SetId($id){
        $this->id = $id;
        return $this;
    }

}



?>



