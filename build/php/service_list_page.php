<?php
/**
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
        $select = new Select($this->path, array_merge(Array("Yleisnäkymä","------------"), $this->con->q("SELECT DISTINCT responsibility FROM responsibilities", Array(),"all_flat")));
        $this->Set("select",$select->SetCurrentSelected($this->filterby)->SetId("respfilter")->OutputSelect());
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

?>
