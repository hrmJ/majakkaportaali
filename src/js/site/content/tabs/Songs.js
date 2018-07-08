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
        var TODO_MAKE_POSSIBLE = undefined;
        if (this.CheckLyricsOk() || TODO_MAKE_POSSIBLE){
            console.log("SAVING");
        }
        else{
            console.log("Not saving.");
        }
    };

    /**
     *
     * Tarkistaa, ovatko kaikkien messuun määriteltyjen laulujen sanat
     * tietokannassa. TODO: mahdollisuus siirtyä sanoihin klikkaamalla linkkiä.
     *
     *
     */
    this.CheckLyricsOk = function(){
        var msg = new Utilities.Message("",$("#songslots")),
            nolyr = [];
        $(".songslot").each(function(){
            var title = $(this).find(".songinput").val();
            console.log(title);
            if($(this).hasClass("no_lyrics") && nolyr.indexOf(title) == -1){
                msg.Add(title);
                nolyr.push(title);
            }
        });
        if(nolyr.length){
            //Jos joistakin lauluista puuttuu sanoja, varoita tästä
            //MUTTA anna mahdollisuus jättää sanat merkitsemättä
            msg.SetTitle("Portaalista puuttuvat seuraavien laulujen sanat:")
               .SetFooter(`Lisää sanat klikkaamalla laulun nimen vieressä
                   olevaa kynäkuvaketta. Jos lauluun ei kuulu sanoja,
                   klikkaa kynäkuvaketta ja ruksaa avautuvan ruudun "ei sanoja" -laatikko. 
                   `);
            msg.AddCloseButton().AddOkButton().Show(999999);

            return false;
        }
    
        return true;
    
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
