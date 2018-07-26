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
     * @param Mustache $template_engine Mustache-template engine
     * @param string $slotstring Kaikki messun rakenne-elementit merkkijonona (html)
     *
     */
    protected $con;
    protected $service_id = 0;
    protected $table = "presentation_structure";
    public $template_engine;
    public $slotstring;
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
     * Lataa käyttäjän perusmessupohjaan  määrittelemät osiot.
     * TODO muistiinpanot/apumerkinnät, joista ei tule omaa diaansa.
     *
     * $service_id jos haetaan messuspesifiä rakennetta, messun id (oletus nolla)
     *
     */
    public function LoadSlots(){
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
     * Hakee kaikki eri luokat ( ~ esim. messun osiot), jotka tässä portaalissa
     * ovat käytössä
     */
    public function LoadSlideClassNames(){
        $data = $this->con->select("styles",[
            "classname" =>  Medoo::raw('DISTINCT(classname)')
            ],
            ["classname[!]" => "sample"]
        );
        return $data;
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
                    "multiname"
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


}



?>
