<?php
/**
 *
 * Sisältää oliot ja funktiot, jotka liittyvät messujen käsittelyyn
 *
 */

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
function GetCurrentSeason($con){
    $date = date('Y-m-d');
    $season = $con->q("SELECT id, name, startdate, enddate FROM seasons WHERE startdate <=:date AND enddate >=:date ORDER BY startdate", Array("date"=>$date),"row");
    #Jos nykyinen pvm ei osu mihinkään kauteen
    if(!$season) #1: ota seuraava kausi tulevaisuudesta
        $season = $con->q("SELECT id, name, startdate, enddate FROM seasons WHERE startdate >=:date ORDER BY startdate", Array("date"=>$date),"row");
    if(!$season) #2: ota edellinen kausi menneisyydestä
        $season = $con->q("SELECT id, name, startdate, enddate FROM seasons WHERE enddate <=:date ORDER BY enddate DESC", Array("date"=>$date),"row");
    return  $season;
}


/**
 *
 * Tallentaa käyttäjän tekemät muokkaukset tietokantaan.
 * 
 * @param DbCon $con yhteys tietokantaan
 * @param integer $id messun id
 * @param array $values taulukko niistä vastuista, joita ollaan päivittämässä. Tyyppiä "vastuu"=>"vastuullinen".
 *
 */
function SaveServiceDetails($con, $id, $values){
    foreach($values as $key => $value){
        $con->q("UPDATE responsibilities SET responsible = :responsible WHERE service_id = :id AND responsibility = :responsibility",Array("id"=>$id,"responsible"=>$value,"responsibility"=>$key),"none");
    }
}


/**
 *
 * Tallentaa käyttäjän tekemät muokkaukset tietokantaan.
 * 
 * @param DbCon $con yhteys tietokantaan
 * @param string $filterby vastuu, jonka mukaan suodatetaan
 * @param array $season taulukko, jossa kauden alku- ja loppupäivät
 *
 * @return array Näytettävät (mahdollisesti suodatetut) messut sisältävä taulukko
 *
 */
function FilterContent($con, $filterby, $season){
    $dates_and_themes = $con->q("SELECT servicedate, theme, id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));
    if($filterby=="Yleisnäkymä")
        return $dates_and_themes;

    $serviceids = $con->q("SELECT id FROM services WHERE servicedate >= :startdate AND servicedate <= :enddate ORDER BY servicedate", Array("startdate"=>$season["startdate"], "enddate"=>$season["enddate"]));
    $filteredids = Array();
    foreach($serviceids as $sid){
        $sid[0];
        $filteredids[] = $sid["id"];
    }
    $responsibles =  $con->q("SELECT service_id, responsible FROM responsibilities WHERE responsibility = ? AND service_id IN (" .  implode(",", array_fill(0, sizeof($filteredids), "?")) . ") ORDER BY service_id", array_merge(Array($filterby),$filteredids));
    $returnarray = Array();
    foreach($responsibles as $key=> $responsible){
        $returnarray[] = Array("servicedate"=>$dates_and_themes[$key]["servicedate"],"theme"=>$responsible["responsible"],"id"=>$dates_and_themes[$key]["id"]);
    }
    return $returnarray;
}

?>
