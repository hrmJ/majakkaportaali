/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/


var Service = function(){

    service_id = 2;

    /**
     * Messun tiedot -välilehti. Yksittäisen messun aihe, raamatunkohdat
     * ja muu yleisen tason (ei ihmisiä koskeva )info, tämän muokkaus ym.
     *
     **/
    var Details = function(){

        /**
         *
         * Hakee messun teeman
         *
         * @param callback funktio, joka ajetaan kun lataus on valmis
         *
         *
         **/
        this.GetTheme = function(callback){
            $.get("php/ajax/Loader.php",{
                action: "get_service_theme",
                service_id: service_id
                }, callback);
        };

        /**
         *
         * Vaihtaa messun teeman 
         *
         * @param theme uusi teema, joka messulle asetetaan
         *
         **/
        this.SetTheme = function(theme){
            $("#service_theme").text(theme);
        };

    };

    /**
     *
     * Messun vastuunkantajat. (Vastuunkantajat-välilehti)
     *
     **/
    var People = function(){
    };

    /**
     *
     * Messun infodiat
     *
     **/
    var InfoSlides = function(){
    };

    /**
     *
     * Messun rakenne - mahdolliset poikkeamat oletusrakenteesta ym.
     *
     **/
    var Structure = function(){
    };


    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     **/
    function Initialize(){
        console.log("Initializing the service view...");
        Details.GetTheme(Details.SetTheme);
    }

    //Alustetaan eri osiot
    var Details = new Details();

    return {
        Initialize,
    };

}()
