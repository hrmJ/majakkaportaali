/**
 *
 * Lauluvälilehti ja sen toiminnallisuus (huom, lauluslotit ja laululistat omia luokkiaan)
 *
 **/
Service.TabFactory.Songs = function(){

    this.action = "save_songs";


    /**
     *
     *
     **/
    this.SaveTabData = function(){
        var TODO_MAKE_POSSIBLE = undefined;
        if (this.CheckLyricsOk() || TODO_MAKE_POSSIBLE){
            console.log("SAVING");
            console.log(this.action);
            this.__proto__.SaveTabData.bind(this)();
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
        this.$div.find(".slotcontainer").each(function(idx, cont){
            $.each($(cont).find(".songslot"), function(slot_no,slot){
                console.log("LOOK: " + $(slot).find(".song_id").val() || 'BÖÖ');
                data.push({
                    song_title: $(slot).find(".songinput").val() || '',
                    song_id: $(slot).find(".song_id").val() || null,
                    songtype: $(cont).find(".cont_name").text(),
                });
            });
        });
        return data;
    };

};
