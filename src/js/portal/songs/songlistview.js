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
    this.$lyricswindow = $(".sideroller");
    this.$servicesonglist = $(".side-main");
    var self = this;
    /**
     * Näyttää sanalistanäkymän ja piilota messukohtaisen näkymän.
     */
    this.Toggle = function(){
        $(".sideroller").hide();
        self.$container.toggle()
        $(".sideroller").toggleClass("songlistview-is-on");
        $(".below-header").toggle();
        if(!$("nav .dropdown").is(":visible")) {
            this.$container.find("h2").toggle();
            this.$container.find("p").toggle();
            this.$servicesonglist.find("h2").toggle();
        }
    };


    /**
     *
     * Näyttä valitsimen, jossa käyttäjä voi päättää, haluaako katsoa
     * laulun sanoa vai käyttää laulua esim. alkulauluna
     *
     * @param object launcher linkki, joka ikkunan käynnistää
     *
     */
    this.SelectAction = function(launcher){
        //Lisää himmennin muulle näytölle
        Utilities.BlurContent();
        //Tallenna laulun nimi käyttöä varten
        self.active_launcher = launcher;
        launcher.parent()
            .addClass("songname-select")
            .append($("<div class='songname-select-option'>Katso sanoja</div>").click(self.ToggleLyricsView))
            .append($("<div class='songname-select-option'>Käytä laulua</div>").click(self.ToggleRoleSelect))
            .find("a,div").wrapAll("<div class='option-container'></div>")
            .slideDown("slow");
    };

    /**
     *
     * Palauttaa mäppinä css:ää varten tapahtuman käynnistäneen elementin
     * sijainnin + elementin pituuden
     *
     */
    this.GetActiveLauncherPosition = function(){
        var par = ($(".songname-select"));
        if(($(".container").width() - (par.position().left + par.width()))<300){
            var pos = {left:-par.position().left + "px", top:"-50px", width:$(".container").width()}
            //Pienellä näytöllä piilota alta pois valintalinkit
            $(".option-container").hide();
        }
        else{
            var pos = {left:par.width()+40+"px", top:"-50px", width:"300px"}
        }
        return pos;
    }

    /**
     *
     * Piilottaa kaikki kelluvat valitsinikkunat
     *
     * @param boolean removeblur poistetaanko taustan himmennys
     *
     */
    this.HideActionSelectors = function(removeblur){
        if(removeblur) $(".blurcover").remove();
        $(".songname-select-option").remove();
        $(".songrole-select").remove();
        $(".songnames-container div").removeClass("songname-select");
    }

    /**
     *
     * Lataa suodatetut laulujen nimet
     *
     * @param jQueryDom  launcher elementti, joka käynnistää latauksen
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
        LoadLyricsByTitle(self.active_launcher.text(),false);
        self.HideActionSelectors(true);
        //Piilota muut kuin laulun sanat, jos pienempi näyttö
        if(!$("nav .dropdown").is(":visible")) {
            self.$container.hide();
            self.$servicesonglist.hide();
        }
        //Lisää sanannäyttödiviin luokka sen tunnistamiseksi, että kutsuttu laulujen nimi-näkymästä
        $(".sideroller").show();
    };

    /**
     * 
     * Avaa ikkuna ja valitse, mikä rooli laululle annetaan messussa.
     *
     */
    this.ToggleRoleSelect = function(){
        var $roleselector = $("<div class='songrole-select'></div>").css(self.GetActiveLauncherPosition()).prependTo($(".songname-select"));
        $(".data-left").each(function(){ $("<div>" + $(this).text() + "</div>").appendTo($roleselector).click(self.SetSongRole)});
    };
    
    /**
     * 
     * Aseta laululle rooli
     *
     */
    this.SetSongRole = function(){
        //Vaihda uusi laulu tekstikenttään
        $('.data-left:contains("' + $(this).text().trim() + '")').next().find("input").val(self.active_launcher.text());
        self.HideActionSelectors(true);
    };

}

