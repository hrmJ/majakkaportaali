/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/


var Service = function(){

    //Ota messun id simppelisti url:sta
    service_id = window.location.href.replace(/.*service_id=(\d+)/,"$1")*1;

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

        /**
         *
         * Tulostaa kaikkien messussa mukana olevien vastuunkantajien nimet
         *
         * @param list_of_people ajax-responssina saatu taulukko muodossa [{responsible:x,responsibility:x},{:},...]
         *
         **/
        this.SetResponsibles = function(list_of_people){
            $("#peopletab ul").remove();
            var $ul = $("<ul class='editable_data_list'></ul>");
            $.each(list_of_people, function(idx, person){
                $ul.append(`<li>
                            <span>${person.responsibility}</span>
                            <span>
                                <input type="text" value="${person.responsible || ''}" </input>
                            </span>
                    </li>`);
            });
            $ul.appendTo("#peopletab");
        };


        /**
         *
         * Hakee messun vastuunkantajat
         *
         * @param callback funktio, joka ajetaan kun lataus on valmis
         *
         *
         **/
        this.GetResponsibles = function(callback){
            $.getJSON("php/ajax/Loader.php",{
                action: "get_responsibles",
                service_id: service_id
                }, callback);
        };

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
        People.GetResponsibles(People.SetResponsibles);
        Comments.LoadComments();
        Comments.CreateThemeSelect();
        Songs.LoadSongSlots();
        Songs.LoadSongLists();
        $("#prepared_for_insertion").hide()
            .draggable({
                revert: "valid"
            });
    }

    /**
     *
     * Palauttaa tämänhetkisen messun id:n
     *
     **/
    function GetServiceId(){
        return service_id;
    }

    //Alustetaan eri osiot
    var Details = new Details();
    var People = new People();

    return {
        Initialize,
        GetServiceId,
    };

}();
