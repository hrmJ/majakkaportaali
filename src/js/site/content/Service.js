/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/


var Service = function(){

    //Kukin välilehti tallennetaan tähän
    TabObjects = {};

    //Ota messun id simppelisti url:sta
    service_id = window.location.href.replace(/.*service_id=(\d+).*/,"$1")*1;

    /**
     *
     * Factory-pattern eri välilehtiä edustavien olioiden luomiseksi
     *
     **/
    function TabFactory(){}

    /**
     *
     * Lisää tallenna-painikkeet kunkin täbin alareunaan
     *
     **/
    TabFactory.prototype.AddSaveButton = function(){
        var $but = $("<button>Tallenna</button>")
                .click(function(){console.log("eee!");});
            this.$div.append($but);
    };

    /**
     *
     * Tuottaa yhden välilehtiolion haluttua tyyppiä
     *
     * @param $tab jquery-esitys yhdestä välilehti-divistä
     *
     **/
    TabFactory.make = function($div){
        var constr = $div.attr("id");
        var tab;
        TabFactory[constr].prototype = new TabFactory();
        tab = new TabFactory[constr]();
        tab.$div = $div;
        TabObjects[constr] = tab;
        return tab;
    };


    /**
     * Messun tiedot -välilehti. Yksittäisen messun aihe, raamatunkohdat
     * ja muu yleisen tason (ei ihmisiä koskeva )info, tämän muokkaus ym.
     *
     **/
    TabFactory.Details = function(){

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
    TabFactory.People = function(){

        /**
         *
         * Tulostaa kaikkien messussa mukana olevien vastuunkantajien nimet
         *
         * @param list_of_people ajax-responssina saatu taulukko muodossa [{responsible:x,responsibility:x},{:},...]
         *
         **/
        this.SetResponsibles = function(list_of_people){
            $("#People ul").remove();
            var $ul = $("<ul class='editable_data_list'></ul>");
            $.each(list_of_people, function(idx, person){
                $ul.append(`<li>
                            <div>${person.responsibility}</div>
                            <div>
                                <input type="text" value="${person.responsible || ''}" </input>
                            </div>
                    </li>`);
            });
            $ul.appendTo("#People .embed-data");
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

        /**
         *
         * Tallentaa muutokset messun vastuunkantajiin
         *
         *
         **/
        this.SaveResponsibles = function(){
            $("");
            //$.getJSON("php/ajax/Saver.php",{
            //    action: "save_responsibles",
            //    service_id: service_id
            //    data: data
            //    }, callback);
        };


    };

    /**
     *
     * Messun infodiat
     *
     **/
    TabFactory.Infoslides = function(){
    };

    /**
     *
     * Messun rakenne - mahdolliset poikkeamat oletusrakenteesta ym.
     *
     **/
    TabFactory.Structure = function(){
    };


    /**
     *
     * Lauluvälilehti ja sen toiminnallisuus (huom, lauluslotit ja laululistat omia luokkiaan)
     *
     **/
    TabFactory.Songs = function(){
    };


    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     **/
    function Initialize(){
        console.log("Initializing the service view...");
        $("#tabs > div").each(function(){
            TabFactory.make($(this));
        })
        TabObjects.Details.GetTheme(TabObjects.Details.SetTheme);
        TabObjects.People.GetResponsibles(TabObjects.People.SetResponsibles);
        for(this_tab in TabObjects){
            TabObjects[this_tab].AddSaveButton();
        }

        Comments.LoadComments();
        Comments.CreateThemeSelect();
        SongSlots.LoadSongsToSlots();
        SongLists.LoadSongLists();
        $("#prepared_for_insertion").hide()
            .draggable({
                revert: "valid"
            });
        //Luodaana kustakin välilehdestä oma olionsa
    }

    /**
     *
     * Palauttaa tämänhetkisen messun id:n
     *
     **/
    function GetServiceId(){
        return service_id;
    }

    return {
        Initialize,
        GetServiceId,
    };

}();
