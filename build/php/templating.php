<?php
/**
 * Sisältää oliot ja funktiot, jotka liittyvät pohjien (templates) käyttöön.
 *
 */


/**
 *
 * Sivupohjaolio, joka vastaa sisällön näyttämisestä.
 * Jokainen sivu, joka luodaan, on oma Template-luokan
 * olionsa.
 *
 * Lähtökohta: http://www.broculos.net/2008/03/how-to-make-simple-html-template-engine.html#.WScryR_S3UI
 *
 * @param string $file pohjan tiedostonimi sisältäen koko suhteellisen hakemistopolun kutsujatiedostosta katsoen. (esim. templates/x.tpl)
 * @param array $values mitä pohjaan syötetään
 *
 */
class Template{
    protected $file;
    protected $values = Array();

    /**
    * @param string $file pohjan tiedostonimi
    */
    public function __construct($file){
        $this->file = $file;
    }

    /**
    *
    * Syöttää pohjaan arvoja: esimerkiksi sen, mikä merkkijono (html-koodi) korvaa
    * pohjassa olevan [@table]-paikanmerkin.
    *
    * @param string $bookmark Se kohta pohjaa, joka korvataan ("kirjanmerkki")
    * @param string $content Html-sisältö, joka syötetään kirjanmerkin paikalle
    *
    */
    public function Set($bookmark, $content){
        $this->values[$bookmark] = $content;
    }

    /**
    *
    * Tulostaa pohjan, johon arvot on syötetty. Palauttaa pohjan merkkijonona.
    *
    * @return string pohja, joka tulostetaan
    *
    */
    public function Output(){
        if(!file_exists($this->file))
            return "Error loading template file: $this->file";

        $output = file_get_contents($this->file);

        foreach($this->values as $bookmark => $content){
            $tagToReplace = "[@$bookmark]";
            $output = str_replace($tagToReplace, $content, $output);
        }

        return $output;
    }

    /**
     *
     * Yhdistää esimerkiksi taulukon solut tai listan rivit ja palauttaa
     * taulukon/listan merkkijonona
     *
     * @return string taulukko merkkijonona
     *
     */
    public function OutputRows(){
        $output = "";
        foreach($this->rows as $row){
            $output .= "\n" . $row->Output();
        }
        return $output;
    }

}

/**
 *
 * Edustaa taulukkoa, joka voidaan tulostaa sivulle esimerkiksi messujen listan
 * kuvaamiseen.
 *
 * @param array $rows taulukon rivit, joista kukin on oma servicelistrow-pohjansa
 *
 */
class DataTable{


    protected $rows = Array();

    public function __construct(){
        foreach($this->data as $datarow){
            $tpl = new Template($this->templatefile);
            switch($this->type){
                case "list":
                    $tpl->Set("category", FormatDate($datarow["servicedate"]));
                    $tpl->Set("value", $datarow["theme"]);
                    $tpl->Set("id", $datarow["id"]);
                    break;
                case "details":
                    $tpl->Set("category", $datarow["responsibility"]);
                    $tpl->Set("value", $datarow["responsible"]);
                    $tpl->Set("name", $datarow["responsibility"]);
                    break;
                case "songlist":
                    if (!isset($this->counttype[$datarow["songtype"]]))
                        $this->counttype[$datarow["songtype"]] = 1;
                    else
                        $this->counttype[$datarow["songtype"]]++;

                    $tpl->Set("name", $datarow["songtype"]);

                    //Ylistys- ja ehtoollislaulut: useampi samaa tyyppiä, lisää indeksi
                    if(in_array($datarow["songtype"],Array("ws","com")))
                        $tpl->Set("name", $datarow["songtype"] . "_{$this->counttype[$datarow['songtype']]}");

                    switch ($datarow["songtype"]){
                        case "paivanlaulu":
                            $tpl->Set("category", "Päivän laulu");
                            break;
                        case "loppulaulu":
                            $tpl->Set("category", "Loppulaulu");
                            break;
                        case "alkulaulu":
                            $tpl->Set("category", "Alkulaulu");
                            break;
                        case "ws":
                            $tpl->Set("category", "Ylistyslaulu {$this->counttype[$datarow['songtype']]}");
                            break;
                        case "com":
                            $tpl->Set("category", "Ehtoollislaulu {$this->counttype[$datarow['songtype']]}");
                            break;
                    }

                    $tpl->Set("value", $datarow["song_title"]);
                    break;
            }
            $this->rows[] = $tpl;
        }
    }


    /**
     *
     * Yhdistää solut ja palauttaa taulukon merkkijonona
     *
     * @return string taulukko merkkijonona
     *
     */
    public function Output(){
        $output = "";
        foreach($this->rows as $row){
            $output .= "\n" . $row->Output();
        }
        return $output;
    }

}

/**
 *
 * Taulukko messujen listan kuvaamista varten.
 *
 * @param string $type taulukon tyyppi 
 *
 */
class ServiceListTable extends DataTable{

    protected $type = "list";

    /**
     *
     *@param string $path polku templates-kansioon
     *@param Array $servicedata taulukkojen taulukko;  sisemmän taulukon alkiot nimillä "servicedate" ja "theme"
     *
     */
    public function __construct($path, $servicedata){
        $this->templatefile = "$path/servicelistrow.tpl";
        $this->data = $servicedata;
        parent::__construct();
    }

}


/**
 *
 * Taulukko, jossa näkyvät messussa laulettavat laulut ja jossa
 * lauluja voi muuttaa ja syöttää uusia.
 *
 * @param string $type taulukon tyyppi
 * @param  $nth taulukon tyyppi
 *
 */
class SongDataTable extends DataTable{

    protected $type = "songlist";

    /**
     *
     *@param string $path polku templates-kansioon
     *@param Array $servicedata taulukkojen taulukko;  sisemmän taulukon alkiot nimillä "category" ja "value"
     *
     */
    public function __construct($path, $servicedata){
        $this->counttype = Array();
        $this->templatefile = "$path/songlistrow.tpl";
        $this->data = $servicedata;
        parent::__construct();
    }

}


/**
 *
 * Taulukko yksittäisen messun vastuunkantajien kuvaamista varten.
 *
 * @param string $type taulukon tyyppi
 *
 */
class ServiceDetailsTable extends DataTable{

    protected $type = "details";

    /**
     *
     *@param string $path polku templates-kansioon
     *@param Array $servicedata taulukkojen taulukko;  sisemmän taulukon alkiot nimillä "responsibility" ja "responsible"
     *
     */
    public function __construct($path, $servicedata){
        $this->templatefile = "$path/servicedetailsrow.tpl";
        $this->data = $servicedata;
        parent::__construct();
    }

}


/**
 *
 * Taulukko yksittäisen messun responsibilitynkantajien kuvaamista varten.
 *
 * @param string $type taulukon tyyppi
 *
 */
class Select extends Template{

    /**
     *
     * @param string $path polku templates-kansioon
     * @param array $optiondata taulukko arvoista, jotka syötetään select-elementin riveiksi
     * @param string $selected se arvo, joka valitaan, kun elementti luodaan
     * @param string $label select-elementin ensimmäinen, otsikkona toimiva  arvo
     * @param array $valuedata option-elementin value-attribuutin arvot taulukkona
     *
     */
    public function __construct($path, $optiondata, $selected, $label, $id="", $valuedata=Array()){
        parent::__construct("$path/select.tpl");
        $optiondata = array_merge(Array(Array($label),Array("------------")), $optiondata);
        if($valuedata)
            $valuedata = array_merge(Array("",""), $valuedata);
        $options="";
        foreach($optiondata as $key=>$option){
            $tpl = new Template("$path/option.tpl");
            $tpl->Set("content",$option[0]);
            if($option[0]==$selected)
                $tpl->Set("selected","selected");
            else
                $tpl->Set("selected","");
            if(sizeof($optiondata)==sizeof($valuedata))
                $tpl->Set("value",$valuedata[$key]);
            else
                $tpl->Set("value",$option[0]);
            $options .= $tpl->Output();
        }
        $this->Set("content",$options);
        $this->Set("id",$id);
    }

}

/**
 *
 * Taulukko yksittäisen messun responsibilitynkantajien kuvaamista varten.
 *
 * @param string $type taulukon tyyppi
 *
 */
class Submit extends Template{

    /**
     *
     * @param string $path polku templates-kansioon
     * @param string $name elementin nimi
     * @param string $value Value-attribuutiin teksti
     * @param string $class css-luokka
     * @param boolean $output tulostetaanko heti
     *
     */
    public function __construct($path, $name, $value, $class=""){
        parent::__construct("$path/submit.tpl");
        $this->Set("name",$name);
        $this->Set("value",$value);
        $this->Set("class",$class);
    }

}

/**
 *
 * Taulukko yksittäisen messun responsibilitynkantajien kuvaamista varten.
 *
 * @param string $type taulukon tyyppi
 *
 */
class UiMenu extends Template{

    /**
     *
     * Jquery Ui:n menu-widgetin mukainen menupohja
     *
     * @param string $path polku templates-kansioon
     * @param array $data elementit, jotka kuuluvat menuun
     *
     */
    public function __construct($path, $data){
        parent::__construct("$path/uimenu.tpl");
        foreach($data as $item){
            $tpl = new Template("$path/uimenurow.tpl");
            $tpl->Set("item", $item);
            $this->rows[] = $tpl;
        }
        $this->Set("menuitems",$this->OutputRows());
    }


}


/**
 *
 * Kokonaisten sivujen (laululista, messulista jne.) template.
 *
 *
 */
class Page extends Template{

    public function __construct(){
        parent::__construct("{$this->path}/{$this->type}.tpl");
        $this->layout = new Template("{$this->path}/layout.tpl");
        $byline = "";
        $title = "";
        switch($this->type){
            case "songlist":
                $this->con = new SongCon("$this->path/../../config.ini");
                $byline = "Laulujen syöttö";
                $bodyclass = "songs";
                $title = "Lauluut majakkamessuun xx. (Bändinä x)";
                break;
            case "servicelist":
                $this->con = new ServiceListCon("$this->path/../../config.ini");
                $byline = "Majakkamessut kaudelle x";
                $bodyclass = "servicelist";
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

/**
 *
 * Perusnäkymän template.
 *
 * @param string $type mistä sivutyypistä on kyse.
 *
 */



class ServiceListPage extends Page{

    public $type = "servicelist";

    /**
     *
     * @param string $path polku templates-kansioon
     * @param string $filterby vastuu, jonka mukaan suodatetaan.
     *
     */
    public function __construct($path, $filterby){
        $this->path = $path;
        $this->filterby = $filterby;
        parent::__construct();
    }

    /**
     *
     * Luo valitsimen, jolla messuja voi suodattaa vastuiden mukaan
     *
     *
     */
    public function InsertResponsibilitySelect(){
        $responsibilities = $this->con->q("SELECT DISTINCT responsibility FROM responsibilities", Array());
        $select = new Select($this->path, $responsibilities, $this->filterby, "Yleisnäkymä","respfilter");
        $this->Set("select", $select->Output());
    }

    /**
     *
     * Asettaa sivulle submit-elementin ja tietoja riippuen siitä, onko
     * kyseessä yleisnäkymä vai vastuun perusteella suodatettu näkymä
     *
     */
    public function SetPageVersion(){
        $subval = "";
        if($this->filterby!="Yleisnäkymä"){
            $sub = new Submit($this->path, "filteredchanges","Tallenna","");
            $subval = $sub->Output();
            $this->Set("help", "Muista tallentaa muutokset sivun alalaidassa olevalla Tallenna-painikkeella. Pääset takaisin alkunäkymään valitsemalla pudotusvalikosta kohdan 'yleisnäkymä'.");
        }
        else{
            $this->Set("help", "Klikkaa päivämäärää, niin siirryt tarkempaan messukohtaiseen näkymään. Alla olevasta pudotusvalikosta voit näyttää joka messun vain tietyn vastuun osalta.");
        }
        $this->Set("submit", $subval);
    }

    /**
     *
     * Hae messulistan näkymä. Joko päivämäärät ja teemat listaava näkymä
     * tai vastuun mukaan suodatettu näkymä. Jos valittu vastuun mukaan suodatettu,
     * otetaan huomioon, että 
     *
     */
    public function FilterContent(){
        $season = GetCurrentSeason($this->con);
        $dates_and_themes = $this->con->q("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));
        if($this->filterby!="Yleisnäkymä"){
            $serviceids = $this->con->q("SELECT id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));
            $filteredids = Array();
            foreach($serviceids as $sid){
                $sid[0];
                $filteredids[] = $sid["id"];
            }
            $responsibles =  $this->con->q("SELECT service_id, responsible FROM responsibilities WHERE responsibility = ? AND service_id IN (" .  implode(",", array_fill(0, sizeof($filteredids), "?")) . ") ORDER BY service_id", array_merge(Array($this->filterby),$filteredids));
            $servicedata = Array();
            foreach($responsibles as $key=> $responsible){
                $servicedata[] = Array("servicedate"=>$dates_and_themes[$key]["servicedate"],"theme"=>"<input type='text' name='id_{$dates_and_themes[$key]["id"]}' value='{$responsible["responsible"]}'>","id"=>$dates_and_themes[$key]["id"]);
            }
        }
        else
            $servicedata = $dates_and_themes;
        $tablecontent = new ServiceListTable($this->path, $servicedata);
        $this->Set("table", $tablecontent->Output());
    }

}

/**
 *
 * Laulujen syöttösivun template.
 *
 * @param string $type mistä sivutyypistä on kyse.
 *
 */
class SongPage extends Page{

    public $type = "songlist";

    /**
     *
     * @param string $path polku templates-kansioon
     * @param string $id sen messun id, jonka lauluja käsitellään
     *
     */
    public function __construct($path, $id){
        $this->path = $path;
        $this->id = $id;
        $this->multisongsdata = Array("ws", "com");
        $this->multisongtargets = Array("ws"=>"worshipsongs", "com"=>"communionsongs");
        parent::__construct();
    }

    /**
     *
     * Hae yksittäisten laulujen data tai oleta tyhjät, jos dataa ei löydy.
     * Syötä sen jälkeen arvojen perusteella rakennettu html-esitys datasta
     * varsinaiseen sivupohjaan.
     *
     */
    public function SetSingleSongs(){
        $this->singlesongsdata = Array($this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'alkulaulu'",Array("sid"=>$this->id),"row"),
                                 $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'paivanlaulu'",Array("sid"=>$this->id),"row"),
                                 $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = 'loppulaulu'",Array("sid"=>$this->id),"row"));
        $songtypes = Array("alkulaulu","paivanlaulu","loppulaulu");
        foreach($this->singlesongsdata as $key=> $song){
            if(!$song){
                $this->singlesongsdata[$key] = Array("song_title"=>"","songtype"=>$songtypes[$key]);
            }
        
        }
        $this->SetDataTable($this->singlesongsdata, "singlesongs");
    }

    /**
     *
     * Hae ylistyslaulujen data
     * tai oleta tyhjät, jos dataa ei löydy.
     *
     * @param Array $types Taulukko, joka kertoo, mistä lauluista on kyse (ylistys- vai ehtoollis-)
     *
     */
    public function SetMultiSongs($types){
        foreach($types as $type){
            $this->multisongsdata[$type] = $this->con->q("SELECT song_title, songtype FROM servicesongs WHERE service_id = :sid AND songtype = :type ",Array("sid"=>$this->id, "type"=>$type));
            if(sizeof($this->multisongsdata[$type])==0)
                $this->multisongsdata[$type] = Array(Array("song_title"=>"","songtype"=>$type));
            $this->SetDataTable($this->multisongsdata[$type], $this->multisongtargets[$type]);
        }
    }


    /**
     *
     * Hakee tietokannasta, mitkä laulut on merkitty Jumalan karitsa- tai Pyhä-versioiksi.
     * tulostaa select-elementit näiden valitsemista varten
     *
     * @param Array $roles Se, mitä liturgisten laulujen tyyppejä messussa on käytössä
     *
     */
    public function SetLiturgicalSongs($roles){
        foreach($roles as $role){
            $texts = $this->con->q("SELECT CONCAT(title, titleseparator) FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>$role),"all");
            $ids = $this->con->q("SELECT id FROM liturgicalsongs WHERE role=:role ORDER by ID",Array("role"=>$role),"all_flat");
            $select = new Select($this->path, $texts, "Valitse versio", "Valitse versio", $role . "_select", $valuedata=$ids);
            $this->Set("{$role}_menu", $select->Output());
        }
    }




}

?>

