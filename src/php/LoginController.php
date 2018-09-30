<?php

namespace Portal;

/**
 *
 * Kontrolloi sisäänkirjautumista ja kirjautuneena oloa
 *
 * @param $con Medoo-tietokantayhteys
 * @param $salt suola, jota salasanojen skrämbläyksessä käytetty lisänä (config.ini-tiedostosta)
 *
 */
class LoginController{

    private $con;
    private $salt;

    /**
     *
     *
     */
    public function __construct($con, $salt){
        session_start();
        $this->con = $con;
        $this->salt = $salt;
    }


    /**
     *
     * Kokeilee kirjautua käyttäjän antamilla tunnuksilla
     *
     * @param $login käyttäjänimi
     * @param $password salasana (vielä skrämbläämättä takaisin)
     *
     */
    public function TryLogin($login, $password){
        $id = $this->con->get("users", "id", 
            [
            "username" => $login, 
            "password" =>md5($password . $this->salt)
            ]);
        if ($id){
            $_SESSION["IsLoggedIn"] = $login;
            return "success";
        }
        //Kirjaa kaiken varalta (testit) ulos, jos ei hyväksytty
        if(isset($_SESSION["IsLoggedIn"])){
            unset($_SESSION["IsLoggedIn"]);
        }
        return "failure";
    
    }


    /**
     *
     * Kirjautuu ulos
     *
     *
     */
    public function Logout(){
            unset($_SESSION["IsLoggedIn"]);
    }

    /**
     *
     * Testaa, että käyttäjä on kirjautunut sisään
     *
     */
    public function TestIsLoggedIn(){
        if (!isset($_SESSION["IsLoggedIn"])){
            header("index.php");
            exit();
        }
    }

    /**
     *
     * Testaa, kuka käyttäjä on kirjautunut sisään
     *
     */
    public function TestWhoIsLoggedIn(){
        if (!isset($_SESSION["IsLoggedIn"])){
            return "Ei kirjauduttu";
        }
        else{
            return $_SESSION["IsLoggedIn"];
        }
    }


}

?>

