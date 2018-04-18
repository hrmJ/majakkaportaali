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
         * Lataa messulista
         *
         * @param callback funktio, joka ajetaan kun lataus on valmis
         *
         **/
        this.LoadServices = function(callback){
            $.getJSON("php/ajax/Loader.php",{
                action: "get_list_of_services"
                }, callback);
        };

        /**
         *
         * Tulostaa listan ja liittää sen osaksi html-DOMia
         *
         * @param data listaan syötettävät tiedot
         *
         **/
        this.Output = function(data){
            $("#servicelist").html("");
            $.each(data,function(idx, service){
                $("#servicelist").append(`
                    <li>${service.theme}
                    /li>
                    `);
            });
        };
    }

    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     **/
    function Initialize(){
        console.log("Initializing the list of services...");
        List_of_services.LoadServices(List_of_services.Output);
    }

    //Alustetaan eri osiot
    var List_of_services = new List();

    return {
        Initialize,
    };

}()
