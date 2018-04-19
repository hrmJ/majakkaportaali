<?php

namespace Portal\utilities;

/**
 *
 * Luokka yksinkertaista päivämäärien muokkausta varten
 *
 **/
class DateFormatter{


    /**
     *
     * Asettaa päivämäärän merkkijonon perusteella
     *
     * @param string $date päivämäärä muodossa YYYY-MM-DD
     *
     **/
    public function SetDate($date){
        $this->date = $date;
        $this->ParseMonthDayYear();
        return $this;
    }

    /**
     *
     * Muokkaa päivämäärän suomalaiseen esitysmuotoon.
     *
     * @return string merkkijonomuotoinen muokattu päivämäärä
     *
     */
    public function FormatDate(){
        return $this->date_arr["day"] . "." . $this->date_arr["month"] . "." . $this->date_arr["year"];
    }


    /**
     *
     * Erottelee kuukauden, vuoden ja päivän Päivämääräoliosta.
     *
     **/
    public function ParseMonthDayYear(){
        $month = substr($this->date, 5,2);
        $year = substr($this->date, 0,4);
        $day = substr($this->date, 8,2);
        $this->date_arr = Array("day"=>$this->RemoveZero($day), "month"=>$this->RemoveZero($month), "year"=>$year);
        return $this;
    }

    /**
     *
     * Poistaa nollat yksittäisistä numeroista, niin että 05 -> 5
     * 
     * @param string $input
     * @return string siistitty numero
     *
     **/
    public function RemoveZero($input){
        if(substr($input,0,1)=="0")
            $input  = substr($input,1,1);
        return $input;
    }

}

?>

