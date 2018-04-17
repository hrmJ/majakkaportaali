/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/


var Servicelist = function(){

    season = "?";

    /**
     *
     * Lista kaikista yhden tietyn kauden messuista
     *
     **/
    var List = function(){
    

        /**
         *
         * Tulostaa listan ja liittää sen osaksi html-DOMia
         *
         **/
        this.Output = function(){
        
        }
    
    }

    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     **/
    function Initialize(){
        console.log("Initializing the list of services...");
        List_of_services.Output();
    }

    //Alustetaan eri osiot
    var List_of_services = new List();

    return {
        Initialize,
    };

}()
