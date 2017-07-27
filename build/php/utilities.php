<?php
/**
 *
 * Sisältää yleiskäyttöisiä apufunktioita ym.
 *
 */


/**
 *
 * Muokkaa päivämäärän suomalaiseen esitysmuotoon.
 *
 * @param date $date päivämäärä, joka halutaan muuttaa
 * @return string merkkijonomuotoinen muokattu päivämäärä
 *
 */
function FormatDate($date){
    $date_arr = ParseMonthDayYear($date);
    return $date_arr["day"] . "." . $date_arr["month"] . "." . $date_arr["year"];
}


/**
 *
 * Erottele kuukausi, vuosi ja päivä Päivämääräoliosta.
 *
 * @param date $date Päivämäärä, joka jäsennetään.
 * @return array taulukko, jossa päivä, kuukausi ja vuosi on eroteltu ja siistitty
 *
 **/
function ParseMonthDayYear($date){
    $month = substr($date, 5,2);
    $year = substr($date, 0,4);
    $day = substr($date, 8,2);
    return Array("day"=>RemoveZero($day), "month"=>RemoveZero($month), "year"=>$year);
}



/**
 *
 * Poistaa nollat yksittäisistä numeroista, niin että 05 -> 5
 * 
 * @param string $input
 * @return string siistitty numero
 *
 **/
function RemoveZero($input){
    if(substr($input,0,1)=="0")
        $input  = substr($input,1,1);
    return $input;
}

?>
