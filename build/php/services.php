<?php
/** Sisältää oliot ja funktiot, jotka liittyvät messujen käsittelyyn
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
 * Tallentaa käyttäjän tekemät yhden tietyn vastuun muokkaukset tietokantaan.
 * 
 * @param DbCon $con yhteys tietokantaan
 * @param string $filterby Vastuu, jota ollaan muokkaamassa
 * @param array $values taulukko niistä messujen id:istä, jotka ovat muokkauksen kohteena
 *
 */
function SaveFiltered($con, $filterby, $values){
    foreach($values as $id => $responsible){
        $con->q("UPDATE responsibilities SET responsible = :responsible WHERE service_id = :id AND responsibility = :responsibility",Array("id"=>str_replace("id_","",$id),"responsible"=>$responsible,"responsibility"=>$filterby),"none");
    }
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



?>
