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
        return $this;
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
     * @param array $data elementit, jotka kuuluvat menuun. Elementit voivat olla itse taulukoita, jolloin tehdään alemman tason lista. KUITENKIN NIIN, että vain yksi taso (toistaiseksi) mahdollinen. 
     *
     */
    public function __construct($path, $data){
        parent::__construct("$path/uimenu.tpl");
        foreach($data as $key=>$item){
            if(is_array($item)){
                $tpl = new Template("$path/uisubmenurow.tpl");
                $tpl->Set("parentitem",$key);
                $subitemlist = "";
                foreach($item as $subitem){
                    $subtpl = new Template("$path/uimenurow.tpl");
                    $subtpl->Set("item", $subitem);
                    $subitemlist .= "\n{$subtpl->Output()}";
                }
                $tpl->Set("subitems", $subitemlist);
            }
            else{
                $tpl = new Template("$path/uimenurow.tpl");
                $tpl->Set("item", $item);
            }
            $this->rows[] = $tpl;
        }
        $this->Set("menuitems",$this->OutputRows());
        return $this;
    }


}


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

