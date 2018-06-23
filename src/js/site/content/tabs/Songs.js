/**
 *
 * Lauluvälilehti ja sen toiminnallisuus (huom, lauluslotit ja laululistat omia luokkiaan)
 *
 **/
Service.TabFactory.Songs = function(){

    /**
     *
     *
     **/
    this.SaveTabData = function(){
    };

    /**
     *
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        var data = [];
        this.$div.find(".songslot").each(function(){
            data.push({
                song_title: $(this).find("div:eq(0)").text(),
                songtype: $(this).parents(".slot_container").find(".cont_name").text(),
            });
        });
    };

};
