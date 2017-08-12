/**
 *
 * Erillinen katselunäkymä lauluille ja niiden sanoille
 *
 */


/**
 *
 *
 *
 **/
SongListView = function(){
    this.$container = $(".songlistview");
    this.$servicesonglist = $(".side-main");
    var self = this;
    /**
     * Näytä sanalistanäkymä ja piilota messukohtainen näkymä.
     */
    this.Toggle = function(){
        self.$container.toggle()
        self.$servicesonglist.toggle()
    };
    this.LoadByAlphabet = function(){
    
    };
}
