/**
 *
 * Erillinen katselunäkymä lauluille ja niiden sanoille
 *
 */

var loaderpath = "php/loaders";

/**
 *
 * Laululistanäkymä
 *
 **/
SongListView = function(){
    this.$container = $(".songlistview");
    this.$servicesonglist = $(".side-main");
    var self = this;
    /**
     * Näyttää sanalistanäkymän ja piilota messukohtaisen näkymän.
     */
    this.Toggle = function(){
        $(".sideroller").hide();
        self.$servicesonglist.toggle()
        self.$container.toggle()
        $(".sideroller").toggleClass("songlistview-is-on");
    };


    /**
     *
     * Näytä valitsin, jossa käyttäjä voi päättää, haluaako katsoa
     * laulun sanoa vai käyttää laulua esim. alkulauluna
     *
     * @param object launcher linkki, joka ikkunan käynnistää
     *
     */
    this.SelectAction = function(launcher){
        //Lisää himmennin muulle näytölle
        $("<div class='blurcover'></div>").css({height:$("body").height(),width:$("body").width()}).prependTo($("body"));
        //Tallenna laulun nimi käyttöä varten
        self.active_launcher = launcher;
        launcher.parent()
            .addClass("songname-select")
            .append($("<div class='songname-select-option'>Katso sanoja</div>").click(function(){
                //Lataa sanojen katseluikkuna
                LoadLyricsByTitle(self.active_launcher.text(),false);
                self.ToggleLyricsView();
                self.HideActionSelectors();
            }
            ))
            .append($("<div class='songname-select-option'>Käytä laulua</div>").click(function(){
                //Valitse, mikä rooli laululle annetaan messussa
                var $roleselector = $("<div class='songrole-select'></div>")
                                    .css(self.GetActiveLauncherPosition($(this)))
                                    .prependTo(self.active_launcher);
               $(".data-left").each(function(){
                   $("<div>" + $(this).text() + "</div>").appendTo($roleselector);
               })
            }))
            .slideDown("slow");
    };

    /**
     *
     * Palauta mäppinä css:ää varten tapahtuman käynnistäneen elementin
     * sijainti + elementin pituus
     *
     */
    this.GetActiveLauncherPosition = function(el){
        console.log(el);
        var par = self.active_launcher.parent()
        var pos = {left:"3px", top:"-2px"}
        return pos;
    }

    /**
     *
     * Piilota kaikki kelluvat valitsinikkunat
     *
     */
    this.HideActionSelectors = function(){
        $(".blurcover").remove();
        $(".songname-select-option").remove();
        $(".songnames-container div").removeClass("songname-select");
    }

    /**
     *
     * Lataa suodatetun datan
     *
     * @param jQueryDom  launcher elementti, joka 
     *
     */
    this.LoadData = function(launcher){
        if(launcher[0].tagName == "LI" && launcher.find("li").length==0){
            //Etsi jquery UI-menun alin listataso
            if(launcher.find("span").length>0){
                //Jos kirjainjaettu alakohtiin, suodata niiden mukaan (esim. virsi 001-virsi 051)
                $.getJSON(loaderpath + "/songtitles.php",{songname:"",firstspan:launcher.find("span:eq(0)").text(),lastspan:launcher.find("span:eq(1)").text()},this.InsertData);
            }
            else{
                $.getJSON(loaderpath + "/songtitles.php",{songname:launcher.text(),fullname:"first-letter"},this.InsertData);
            }
        }
    };

    /**
     *
     * Syötä filtteröidyt laulut linkeiksi laululistasivulle
     *
     * @param Array data ajax-kyselyllä ladattu taulukko laulujen nimistä
     *
     */
    this.InsertData = function(data){
        $(".songnames-container").html("");
        $.each(data,function(key, item){
            $("<div><a href='javascript:void(0)'>" + item + "</a></div>").appendTo(".songnames-container");
            //$("<div><a href='javascript:void(0)'>" + item + "</a></div>").appendTo(".songnames-container");
        });
        $(".songnames-container a").click(function(){self.SelectAction($(this))});
    };

    /**
     *
     * Näytä ikkuna sanojen katselemista varten (ja mobiilitilassa sulje muut ikkunat)
     *
     *
     */
    this.ToggleLyricsView = function(){
        //Piilota muut kuin laulun sanat, jos pienempi näyttö
        if(!$("nav .dropdown").is(":visible")) self.$container.hide();
        //Lisää sanannäyttödiviin luokka sen tunnistamiseksi, että kutsuttu laulujen nimi-näkymästä
        $(".sideroller").show();
    };

    
}

