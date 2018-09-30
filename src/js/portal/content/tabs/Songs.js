/**
 *
 * Lauluvälilehti ja sen toiminnallisuus (huom, lauluslotit ja laululistat omia luokkiaan)
 *
 **/
Portal.Service.TabFactory.Songs = function(){

    this.action = "save_songs";

    /**
     *
     * Avaa välilehden ja lataa / päivittää sisällön
     *
     */
    this.Initialize = function(){
        console.log("Initialized the songs tab");
        Portal.SongSlots.LoadSongsToSlots(this);
        SongLists.Initialize();
        $("#prepared_for_insertion")
            .draggable({
                revert: true,
                refreshPositions: true,
                cursor: "move",
                opacity:0.89,
                zIndex:100,
                start: function(e){
                     $(e.target).find(".attach_instructions").hide();
                     $(e.target).find("h4").addClass("attaching_title");
                },
                stop: function(e){
                     $(e.target).find(".attach_instructions").show();
                     $(e.target).find("h4").removeClass("attaching_title");
                },
                classes: {
                    "ui-draggable-dragging": "insert_box_dragging"
                },
                handle: ".fa-arrows",
                //snap:".songinput",
            });
        this.AddSaveButton();
    }

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
            if($(this).hasClass("no_lyrics") && 
                nolyr.indexOf(title) == -1 &&
                $(this).find(".is_instrumental").val() == "no"
            ){
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
                data.push({
                    song_title: $(slot).find(".songinput").val() || '',
                    song_id: $(slot).find(".song_id").val() || null,
                    verses: $(slot).find(".verses").val() || null,
                    is_instrumental: $(slot).find(".is_instrumental").val() || "no",
                    songtype: $(cont).find(".cont_name").text(),
                    tag: $(cont).find(".restriction_val").val(),
                });
            });
        });
        return data;
    };

};
