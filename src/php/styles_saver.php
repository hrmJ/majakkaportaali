<?php
/**
 *
 * Diaesityksen tyylien päivitys
 *
 */



/**
 *
 * Tyylit päivittävä ja uudet dialuokat lisäävä funktio
 *
 * @param DbCon $con tietokantayhteys
 * @param string $newclass css-luokka, joka lisätään, jos sitä ei vielä ole
 *
 */
function UpdateAndAddClasses($con, $newclass){
    $res = $con->q("SELECT count(*) FROM styles WHERE classname = :cn",Array("cn"=>$newclass));
    if(!$res[0][0]){
        //Jos tyyliä ei vielä ole tietokannassa
        $all_styles = $con->q("SELECT tagname, attr, value FROM styles WHERE classname=:cn",Array("cn"=>"sample"),"all");
        //Syötä myöhemmin käytettäväksi oletustyylien mukaiset css-säännöt uutta luokkaa varten
        foreach($all_styles as $style){
            $con->q("INSERT INTO styles (classname, tagname, attr, value, stylesheet) VALUES (:cn,:tn,:attr,:val,:ss)",Array("cn"=>$newclass,"tn"=>$style["tagname"],"attr"=>$style["attr"],"val"=>$style["value"],"ss"=>"default"),"none");
        }
    };
}

?>
