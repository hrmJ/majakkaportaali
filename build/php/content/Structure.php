<?php


namespace Portal\content;

use Portal\slides\Slide;
use Portal\slides\Song;
use Portal\slides\Infoslide;
use Portal\slides\SlideStyle;
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
     * @param Mustache $template_engine Mustache-template engine
     * @param string $slotstring Kaikki messun rakenne-elementit merkkijonona (html)
     * @param Array $injectables Messuun syötettävät yksittäiset tiedot assosiatiivisena taulukkona (esim. "juontaja" => "Maikki")
     *
     */
    protected $con;
    protected $service_id = 0;
    protected $table = "presentation_structure";
    protected $injectables = Array();
    public $template_engine;
    public $slotstring = "";
    private $service_specific_created = false;
    private $columns = ["slot_name", "slot_type", "slot_number",
        "content_id", "addedclass", "header_id"];

    /**
     *
     *
     */
    public function __construct(\Medoo\Medoo $con, $m){
        $this->con = $con;
        $this->template_engine = $m;
    }


    /**
     *
     * Tekee rakenteesta messukohtaisen
     *
     * @param $service_id messun id
     * @param $create_if_not_exist luodaanko messuspesifin taulun sisältö, jos sitä ei ole
     *
     */
    public function SetAsServiceSpecific($service_id, $create_if_not_exist=true){
        $this->service_id = $service_id;
        $this->table = "service_specific_presentation_structure";
        //Tarkistetaan, onko jo tälle messulle tallennettu omaa rakennetta
        $rows = $this->con->select($this->table, "*", ["service_id" => $this->service_id]);
        if(!$rows and $create_if_not_exist){
            $this->service_specific_created = true;
            $slots = $this->con->select("presentation_structure",
                array_merge($this->columns, ["id"]),
                ['ORDER' => [ 'slot_number' => 'ASC' ]]);
            foreach($slots as $slot){
                $slot["service_id"] = $this->service_id;
                $this->con->insert("service_specific_presentation_structure", $slot);
            }
        }
    }

    /**
     *
     * Poistaa slotin
     * 
     * @param $id poistettavan slotin id
     *
     */
    public function RemoveSlot($id){
        $this->con->delete($this->table, ["id" => $id]);
    }

    /**
     *
     * Hakee messuun tai messupoihjaan määritellyt osiot
     *
     */
    public function GetSlots(){
        //Kokeillaan ensin messukohtaista rakennetta
        $slots = $this->con->select("service_specific_presentation_structure", 
            array_merge($this->columns, ["id"]),
            ["service_id" => $this->service_id],
            ['ORDER' => [ 'slot_number' => 'ASC' ]]);
        if($slots){
            //HACK! Miksei Medoo sorttaa??
            usort($slots, function ($item1, $item2) {
                return $item1['slot_number'] <=> $item2['slot_number'];
            });
        }
        if(!$slots){
            //Ei löydy messuspesifiä rakennetta tai haetaan suoraan yleistä
            $slots = $this->con->select("presentation_structure", 
                array_merge($this->columns, ["id"]),
                ['ORDER' => [ 'slot_number' => 'ASC' ]]);
        }

        return $slots;
    }


    /**
     *
     * Lataa messun rakenteen html:ksi
     * TODO muistiinpanot/apumerkinnät, joista ei tule omaa diaansa.
     *
     */
    public function PrintStructure(){
        $slots = $this->GetSlots();
        $this->slotstring = "";
        foreach($slots as $idx => $slot){
            $newslot = $this->template_engine->loadTemplate('slot'); 
            $name = (empty($slot["slot_name"]) ? "Nimetön segmentti" : $slot["slot_name"]);
            $this->slotstring .= "\n\n " . $newslot->render([
                "number" => $slot["slot_number"],
                "addedclass" => $slot["addedclass"],
                "content_id" => $slot["content_id"],
                "header_id" => $slot["header_id"],
                "slot_type" => $this->FormatSlotType($slot["slot_type"]),
                "slot_type_orig" => $slot["slot_type"],
                "slot_name_orig" => $slot["slot_name"],
                "slot_id" => $slot["id"],
                "name" => $name,
            ]);
        }
        return $this;
    }


    /**
     * Tulostaa sivun
     */
    public function OutputPage(){
        $page = $this->template_engine->loadTemplate('service_structure'); 
        return $page->render(["units" => $this->slotstring]);
    }

    /**
     * Muokkaa segmentin tyypistä järkevän suomenkielisen selitteen.
     */
    public function FormatSlotType($name){
        switch($name){
            case "infosegment":
                return "Infodia";
            case "songsegment":
                return "Laulu";
            case "biblesegment":
                return "Raamatunkohta";
        }
    }

    /**
     *
     * Lataa yhden dian sisällön
     *
     * @param $id dian tunniste
     * @param $table  taulu, josta ladataan
     r 
     */
    public function LoadSlide($id, $table){
        switch($table){
            case "infosegments":
                $params = [
                    "maintext", 
                    "header",
                    "genheader",
                    "subgenheader",
                    "imgname",
                    "imgposition"
                ];
                break;
            case "songsegments":
                $params = [
                    "songdescription",
                    "restrictedto",
                    "singlename", 
                    "is_multi"
                ];
                break;
        }
        $data =  $this->con->select($table, $params, ["id"=>$id]);
        if($data)
            return $data[0];
    }

    /**
     *
     * Tallentaa muokatun dian sisällön
     * TAI slotin sisällön, jos $table-parametrina "presentation_structure"
     *
     * @param $id dian tunniste
     * @param $params tallennettavat parametrit
     * @param $table  taulu, johon ladataan
     * 
     */
    public function UpdateSlide($id, $table, $params){
        $this->con->update($table, $params, ["id"=>$id]);
        if(isset($params["addedclass"])){
            $style = new SlideStyle($this->con);
            $style->CheckSlideClassStatus($params["addedclass"]);
        }
        if($table == $this->table){
            $this->RefreshSlotOrder();
        }
        return $this;
    }

    /**
     *
     * Päivittää slottien järjestyksen oikeaksi esim. slottien poiston jne. jälkeen
     *
     * 
     */
    public function RefreshSlotOrder(){
        $data = $this->con->select($this->table, "*");
        //HACK! Miksei Medoo sorttaa??
        usort($data, function ($item1, $item2) {
            return $item1['slot_number'] <=> $item2['slot_number'];
        });
        $i = 1;
        foreach($data as $row){
            #Varmistetaan, että slottien numerointi alkaa 1:stä
            $this->con->update($this->table, ["slot_number" => $i], ["id"=>$row["id"]]);
            $i++;
        }
        return $this;
    }


    /**
     *
     * Tallentaa slottien järjestyksen sen jälkeen kun käyttäjä on muuttanut sitä
     * 
     * @param $newids slottien uudet järjestysnumerot ryhmiteteltynä id:n mukaan
     *
     */
    public function SaveNewSlotOrder($newids){
        $fixed_ids = [];
        if($this->service_specific_created){
            //Jos juuri luoto messukohtainen taulu, haetaan oikeat id:t
            foreach($newids as $idpair){
                $where = [];
                $params = $this->con->select("presentation_structure",$this->columns,["id" => $idpair["slot_id"]]);
                foreach($this->columns as $colname){
                    if($params[0][$colname] and $colname != "slot_number"){
                        $where[$colname] = $params[0][$colname];
                    }
                }
                $fixed_ids[$idpair["slot_id"]] = $this->con->get($this->table, "id", $where);
            }
        };
        foreach($newids as $idpair){
            $id = ($fixed_ids ? $fixed_ids[$idpair["slot_id"]] : $idpair["slot_id"]);
            $this->con->update($this->table, 
                ["slot_number" => $idpair["newnumber"]],
                ["id" => $id]
            );
        }
    }



    /**
     *
     * Syöttää uuden dian sisällön 
     *
     * @param $params tallennettavat parametrit
     * @param $table  taulu, josta ladataan
     * 
     */
    public function InsertSlide($params, $table){
        $this->con->insert($table, $params);
        return $this;
    }

    /**
     *
     * Syöttää uuden messuslotin
     *
     * @param $params tallennettavat parametrit
     * 
     */
    public function InsertNewSlot($params){
        $last_slot_no = $this->con->max($this->table, "slot_number");
        $params["slot_number"] = $last_slot_no + 1;
        $this->con->insert($this->table, $params);
        if(isset($params["addedclass"])){
            $style = new SlideStyle($this->con);
            $style->CheckSlideClassStatus($params["addedclass"]);
        }
        return $this;
    }


    /**
     *
     * Lataa dioihin syötettävissä olevien kuvien nimet
     *
     * 
     */
    public function LoadSlideImageNames(){

        $data = $this->con->select("backgrounds",[
            "filename" => Medoo::raw('DISTINCT(filename)')
            ]);

        return $data;

    }



    /**
     *
     * Lataa dioihin syötettävissä olevien kuvien kuvaukset
     *
     *
     * @param $filename kuvan tiedostonimi
     * 
     */
    public function LoadSlideImageDescription($filename){

        $data = $this->con->get("backgrounds", "description", [ "filename" => $filename ]);

        return $data;

    }


    /**
     *
     * Lataa kaikki segmentit käytettäväksi diaesityksessä
     * 
     */
    public function LoadSlidesForPresentation(){
        $slots = $this->GetSlots();
        foreach($slots as $key => $slot){
            //var_dump($slot["slot_type"]);
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
     * Lisää esitykseen laulusegmentin: tämä voi olla yksittäinen laulu (esim. Alkulaulu)
     * tai laulujen sarja (Ylistyslaulut, Rukouslaulut tms.)
     *
     * @param Array $slot segmentin yleistiedot
     * @param Array $slide_idx segmentin järjestysnumero
     *
     */
    public function AddSongSegment($slot, $slide_idx){
        $songlist = new Songlist($this->con, $this->service_id);
        $songs_of_this_type = $this->con->select("servicesongs",
            ["song_title", "song_id", "songtype"],
            [
                "service_id" => $this->service_id,
                "songtype" => $slot["slot_name"]
            ],
            ['ORDER' => [ 'id' => 'ASC' ]]);

        foreach($songs_of_this_type as $song_idx => $song){
            $songdata = $this->con->get("songdata",
                ["title", "composer", "lyrics", "version_description"],
                ["id" => $song["song_id"]]);
            $songdata["verses"] = $songlist->FetchLyricsById($song["song_id"], true);;
            $this->AddSlide(new Song($this->template_engine, $songdata), 
                $slot["addedclass"], $slot["header_id"], $slide_idx + $song_idx);
            ////Lisätään kukin laulu omana dia(sarja)naan
            //$song_idx++;
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
        $details = $this->con->get("infosegments",
            ["id", "maintext", "header",
            "genheader", "subgenheader", 
            "imgname", "imgposition"],
            ["id" => $slot["content_id"]]);
        $this->AddSlide(
            new Infoslide($this->template_engine, $details, $slot["slot_name"]),
            $slot["addedclass"], $slot["header_id"], $slide_idx);
        return $this;
    }


    /**
     *
     * Lisää diaesitykseen uuden dian
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
        $this->slotstring .= "{$slide->Output()}\n\n";
        return $this;
    }


    /**
     * 
     * Listaa kaikki tietokannassa olevat ylätunnisteet
     *
     */
    public function ListSlideHeaders(){
        $headers = $this->con->select("headers",
            ["id", "template_name", "imgname", "imgposition", 
            "maintext", "is_aside"]);
        return $headers;
    }


    /**
     * 
     * Lisää uuden ylä- tai sivutunnistepohjan
     *
     * @param $tpl_name uuden tunnistepohjan nimi
     *
     */
    public function InsertHeaderTemplate($tpl_name){
        $this->con->insert("headers",
            ["template_name" => $tpl_name, 
            "imgname" => "Ei kuvaa",
            "imgposition" => "left",
            "maintext" => ""]);
        return $this;
    }

    /**
     * 
     * Päivittää ylä- tai sivutunnistepohjan
     *
     * @param $header_id päivitettävän pohjan id
     * @param $params päivitettävät sarakkeet uusine arvoineen
     *
     */
    public function UpdateHeaderTemplate($header_id, $params){
        $this->con->update("headers", $params, ["id" => $header_id]);
        return $this;
    }


    /**
     *
     * Syöttää messuun käyttäjän määrittelemän upotettavan datan, kuten juontajien nimet yms.
     * cf. https://stackoverflow.com/questions/963145/variable-scope-for-php-callback-functions#963163
     *
     **/
    function InjectData(){
        $this->slotstring = preg_replace_callback("/{{([^}]+)}}/",
            [$this, 'InjectThisPieceOfData'],
            $this->slotstring);
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
                    $value = $this->con->get("services", "theme", ["id" => $this->service_id]);
                    break;
                case "Messun päivämäärä":
                    $value = $this->con->get("services", "servicedate", ["id" => $this->service_id]);
                    break;
                default:
                    //JOs ei määritelty mitään spesifimpää, etsi vastuut-taulusta
                    $value = $this->con->query("SELECT responsible FROM responsibilities 
                        WHERE LOWER(responsibility) = :resp and service_id = :id",
                        ["resp"=>strtolower($matches[1]),"id"=>$this->service_id])->fetchColumn();
                    break;
            }
            $this->injectables[$matches[1]] = $value;
        }
        return $this->injectables[$matches[1]];
    }


}



?>
