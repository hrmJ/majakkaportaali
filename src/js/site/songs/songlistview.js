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
        });
        $(".songnames-container a").click(function(){LoadLyricsByTitle($(this).text(),false);
                                           self.ToggleLyricsView()});
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
        $(".sideroller").show("slide");
    };

    
}
