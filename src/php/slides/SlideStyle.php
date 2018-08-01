<?php


namespace Portal\slides;

use Medoo\Medoo;
use PDO;


/**
 *
 * Messudiojen tyylin määritteleminen
 *
 */
class SlideStyle{

    /**
     *
     * @param Medoo $con tietokantayhteys
     * @param String html tulostettamava css-merkkijono
     *
     */
    protected $con;
    public $html = '';

    /**
     *
     *
     */
    public function __construct(\Medoo\Medoo $con){
        $this->con = $con;
    }


    /**
     * Hakee kaikki eri luokat ( ~ esim. messun osiot), jotka tässä portaalissa
     * ovat käytössä
     *
     * @param $sheet jos määritetty jokin tietty tyylipohja, niin tämän nimi
     *
     */
    public function LoadSlideClassNames($sheet=''){
        $where = ["classname[!]" => "sample"];
        $newdata = [];
        if($sheet){
            $where["stylesheet"] = $sheet;
        }
        $data = $this->con->select("styles",[
            "classname" =>  Medoo::raw('DISTINCT(classname)')
            ], $where);

        foreach($data as $row){
            $newdata[] = $row["classname"];
        }
        return $newdata;
    }

    /**
     *
     * Hakee tyylisetin ja tulostaa sen merkkijonoksi
     *
     * @param $classname luokka, jota koskevat tyylit ladataan
     * @param $tag tägi, jota koskevat tyylit ladataan
     * @param $stylesheet stylesheet, jota koskevat tyylit ladataan
     *
     */
    public function GetStylesAsString($classname, $tag='', $stylesheet="default"){
            $rawdata = $this->con->query("SELECT CONCAT(attr, ': ', value, ';') AS line 
                FROM styles 
                WHERE stylesheet = :sheet and 
                classname = :cname and 
                tagname = :tname ",
                ["tname"=>$tag, "cname"=>$classname,
                "sheet"=>$stylesheet])->fetchAll();
            $lines = [];
            foreach($rawdata as $row){
                $lines[] = $row["line"];
            };
            $attrs = implode($lines, "\n    ");
            return $attrs;
    }

    /**
     * Lataa kaikki tyylitietokannassa olevat tyylitiedot tulostettavaksi html-muodossa
     *
     * @param string $stylesheet mahdollisesti haettavan tallennetun tyylisetin nimi
     *
     */
    public function LoadAllStyles($stylesheet="default"){
        //ota talteen tässä stylesheetissä valmiiksi tuetut luokat
        $classnames = $this->LoadSlideClassNames($stylesheet);
        $text_tags = Array("header", "aside", "article","h1","h2","h3","p","img"); 
        $css_style_blocks = "";
        foreach($classnames as $classname){
            //Ensin muut kuin tägeittäin asetellut tyylit
            $attrs = $this->GetStylesAsString($classname,'',$stylesheet);
            $css_style_blocks .= "\n\n$classname {\n    {$attrs}\n}";
            //Sitten tägeittäin (=tekstitasoittain: p, h1, h2 jne... mutta myös article ja header ja aside)
            foreach($text_tags as $tag){
                $attrs = $this->GetStylesAsString($classname, $tag, $stylesheet);
                $css_style_blocks .= "\n\n$classname $tag {\n    {$attrs}\n}";
            }
        }
        $this->html = $css_style_blocks;
    }

    /**
     * Lataa kaikki tyylitietokannassa olevat tyylitiedot ja yhdistä
     * taulukoksi, jonka avulla voidaan nopeasti vertailla, sitä, onko jotakin
     * tyyliä muutettu.
     *
     * @param Array $classes luokat, jotka esityksessä ovat käytössä.
     * @param string $stylesheet mahdollisesti haettavan tallennetun tyylisetin nimi
     *
     */
    public function LoadAllStylesAsArrayOfStrings($stylesheet="default"){
        //ota talteen tässä stylesheetissä valmiiksi tuetut luokat
        $data = $this->con->query("SELECT CONCAT(classname, ';', tagname, ';', attr, ';', value) AS line 
            FROM styles WHERE 
            stylesheet = :sheet AND 
            classname <> 'sample'",
            ["sheet"=>$stylesheet])->fetchAll();
        $newdata = [];
        foreach($data as $row){
            $newdata[] = $row["line"];
        }
        return $newdata;
    }

    /**
     * Listaa kaikki tietokantaan tallennetut tyylipohjat
     *
     */
    public function LoadAllStyleSheets(){
        $data = $this->con->select("styles",
            ["stylesheet" =>  Medoo::raw('DISTINCT(stylesheet)')],
            ["ORDER" => "stylesheet"]);
        $newdata = [];
        foreach($data as $row){
            $newdata[] = $row["stylesheet"];
        }
        return $newdata;
    }

    /**
     * Päivitä koko tyylitietokanta yhden stylesheetin osalta
     *
     * @param Array $all_rows taulukko, jonka jokainen solu on yksi päivitettävä tietokannan sarake
     * @param string $sheet tallennettavan tyylin nimi
     * @param string $isnew onko kyseessä kokoaan uusi tyylipohja ('yes' tai 'no')
     *
     */
    public function UpdateStyles($all_rows, $sheet, $isnew){
        foreach($all_rows as $key => $row){
            $coldata = [
                        "attr" => $row["attr"],
                        "stylesheet" => $sheet,
                        "classname" => $row["classname"],
                        "tagname" => $row["tagname"],
                    ];
            if(key_exists("attr",$row)){
                if($isnew === "no"){
                    $this->con->update("styles",[
                        "value" => $row["value"],
                    ],
                    $coldata
                    );
                }
                else{
                    #$debug = var_export($isnew, true);
                    #$this->con->q("INSERT INTO logger (msg) VALUES (:cn)",
                    #    Array("cn"=>$debug),"none");
                    $coldata["value"] = $row["value"];
                    $this->con->insert("styles", $coldata);
                }
            }
        }
    }


    /**
     *
     * Syöttää uuden tyyliluokan, jos tyylitiedot puuttuvat
     *
     * @param $classname luokan nimi
     * 
     */
    public function CheckSlideClassStatus($classname){
        $existing = $this->con->select("styles","*",["classname" => $classname]);
        if(!$existing){
            $stylesheets = $this->LoadAllStyleSheets();
            $sample = $this->con->select("styles",
                ["tagname", "attr", "value"],
                ["classname" => "sample"]);
            foreach($stylesheets as $sheet){
                foreach($sample as $row){
                    $row["stylesheet"] = $sheet;
                    $row["classname"] = $classname;
                    $this->con->insert("styles",$row);
                }
            }
        }
    }


}



?>
