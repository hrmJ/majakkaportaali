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
        self.$servicesonglist.toggle()
        self.$container.slideToggle()
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
            //Jos ei enää alakohtia kirjainlistalla
            //TODO Virsi x - virsi y
            $.getJSON(loaderpath + "/songtitles.php",{songname:launcher.text(),fullname:"first-letter"},this.InsertData);
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
    };
}
