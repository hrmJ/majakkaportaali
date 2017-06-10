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
 * @param DbCon yhteys tietokantaan
 *
 * @return  array  Taulukon, jossa on ilmaistu messukauden alku- ja loppupäivät.
 *
 */
function GetCurrentSeason($con){
    $date = date('Y-m-d');
    $season = $con->Select("SELECT id, name, startdate, enddate FROM seasons WHERE startdate <=:date AND enddate >=:date ORDER BY startdate", Array("date"=>$date),"row");
    #Jos nykyinen pvm ei osu mihinkään kauteen
    if(!$season) #1: ota seuraava kausi tulevaisuudesta
        $season = $con->Select("SELECT id, name, startdate, enddate FROM seasons WHERE startdate >=:date ORDER BY startdate", Array("date"=>$date),"row");
    if(!$season) #2: ota edellinen kausi menneisyydestä
        $season = $con->Select("SELECT id, name, startdate, enddate FROM seasons WHERE enddate <=:date ORDER BY enddate DESC", Array("date"=>$date),"row");
    return  $season;
}


?>
