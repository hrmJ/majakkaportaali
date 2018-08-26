/**
 *
 * Moduuli erilaisille laulujen selauslistoille
 *
 *
 */
var SongLists = function(){

    var waiting_for_attachment,
        edited_lyrics_callback,
        current_song,
        not_service_specific=false,
        alphalist;

    /**
     * Lista, josta käyttäjä näkee kaikki selattavissa olevat laulut
     *
     **/
    var Songlist = function(){

        this.$anchor = $("#songlist_" + this.list_type);

        /**
         *
         * Hakee alaluokat tietokannasta
         *
         **/
        this.GetAndSetSubCategories  = function(){
            var self = this;
            $.getJSON("php/ajax/Loader.php",
                {
                    action: "get_songlist_" + this.list_type,
                    service_id: Service.GetServiceId(),
                },
                function(data){
                    self.SetSubCategories(data,self);
                }
            );
        };

        /**
         *
         * Lisää alaluokat listaan
         *
         **/
        this.SetSubCategories = function(categories, self){
            self.$anchor.html("");
            $.each(categories, function(idx, el){
                var $li = $(`
                        <li class='songlist_subcat'>${el}</li>
                    `);
                $li.click(function(){
                        self.ListSongs($(this));}
                    );
                self.$anchor.append($li);
            });
        }

        /**
         *
         * Listaa kaikki tämän kategorian / kirjaimen laulut, jotka
         * on jo haettu tietokannasta
         *
         * @param songs laulujen nimet taulukkona
         * @param $launcher tapahtuman laukaissut listaelementti
         * @param self viittaus olioon itseensä
         *
         **/
        this.SetSongs = function(songs, $launcher, self){
            var self = this;
            $ul = $("<ul></ul>").appendTo($launcher);
            $.each(songs, function(idx, el){
                $ul.append(self.GetVersionLink(el));
            });
        };


        /**
         *
         * Luo yksittäisen laulun / version listaelementin liitettäväksi listaan
         *
         * @param title laulun nimi
         *
         */
        this.GetVersionLink = function(title){
            var self = this,
                $li= $(`
                        <li class='songlist_song_container'>
                            <span class='song_title'>${title}</span>
                            <input class='song_id' type='hidden'></input>
                            <ul class='lyrics'></ul>
                        </li>
                    `);
            $li.find(".song_title").click(self.ShowVersionInfo.bind(self));
            return $li;
        }


        /**
         *
         * Näyttää tarkemmat tiedot ja toiminnot yksittäisestä laulun versiosta
         * 
         * @param e klikkaustapahtuma
         *
         */
        this.ShowVersionInfo = function(e){
            var self = this,
                li_elements = [
                $("<li><a href='javascript:void(0);'>Käytä tässä messussa</a></li>")
                    .click(self.PrepareSongForInsertion.bind(this)),
                $("<li><a href='javascript:void(0);'>Tutki / muokkaa</a></li>")
                    .click(self.ExamineSong.bind(this))],
                $ul = $("<ul class=lyrics_actions></ul>");
            if (not_service_specific){
                //Poistetaan "Käytä messussa" -kohta, jos ei messuspesifi
                li_elements = li_elements.slice(1);
            }
            //Estetään subheading-elementin sulkeutuminen takaisin
            e.stopPropagation();
            $(e.target).parent().find(".lyrics_actions").remove();
            $.each(li_elements, function(){
                $ul.append($(this));
            });
            $(e.target).parent().find(".song_title")
                .after($ul);
            this.ShowSongVersions($(e.target).parent());
                    
        };
        

        /**
         *
         * Näyttää samannimisen laulun kaikki versiot
         *
         * @param $li laulun sisältävä listaelementti
         *
         */
        this.ShowSongVersions = function($li){
            var self = this,
                title = $li.find(".song_title").text();
            $.getJSON("php/ajax/Loader.php",{
                    action:  "check_song_title",
                    service_id: Service.GetServiceId(),
                    title: title
                    },
                function(ids){
                    if(ids.length == 1){
                        SetLyrics(ids[0], $li.find(".lyrics"), true);
                        $li.find(".song_title").addClass("songlist_entry");
                        $li.find(".song_id").val(ids[0]);
                    }
                    else{
                        //Monta versiota
                        $actionli = $li.find(".lyrics_actions").clone(true);
                        $li.find(".lyrics_actions").remove();
                        $ul = $("<ul></ul>").appendTo($li);
                        $.each(ids, function(idx, this_id){
                            var $this_li = self.GetVersionLink("Versio "  + (idx +1));
                            $this_li.find(".song_title").addClass("songlist_entry");
                            $this_li.find(".song_id").val(this_id);
                            $ul.append($this_li);
                            $.when(SetLyrics(this_id, $this_li.find(".lyrics"), true)).done(
                                function(){
                                    $actionli.clone(true).insertAfter($this_li.find(".song_title"));
                                }
                            );
                        });
                    }
                });
        };


        /**
         *
         * Erottaa listasta valitun laulun, niin että se voidaan
         * liittää osaksi messua.
         *
         * @param ev tapahtuma
         *
         **/
        this.PrepareSongForInsertion = function(ev){
            ev.stopPropagation();
            this.GetCurrentSong(ev);
            waiting_for_attachment =  this.current_song.title;
            $("#songlist").hide();
            $(".blurcover").remove();
            $("#prepared_for_insertion").find("h4").text(this.current_song.title);
            $("#prepared_for_insertion").find(".song_id").val(this.current_song.id);
            $("#prepared_for_insertion").show();
        };

        /**
         *
         * Avaa erillisen tilan listasta valitun yksittäisen laulun tutkimista
         * ja esimerkiksi sanojen muokkaamista varten
         *
         * @param ev tapahtuma
         *
         **/
        this.ExamineSong = function(ev){
            ev.stopPropagation();
            this.GetCurrentSong(ev);
            var slot = new Portal.SongSlots.SongSlot(this.current_song.title,
                    0,
                    undefined,
                    this.current_song.id);
            slot.SetNotServiceSpecific();
            slot.CheckDetails();
        };

        /**
         *
         * Hakee tiedon siitä, mitä laulua nyt tutkitaan
         *
         * @param ev tapahtuma
         *
         */
        this.GetCurrentSong = function(ev){
            var $launcher = $(ev.target),
                parent_lis = $launcher.parents(".songlist_song_container"),
                song_id = $(parent_lis[0]).find(".song_id").val(),
                song_title = $(parent_lis[parent_lis.length-1]).find(".song_title:eq(0)").text();

            this.current_song =  {
                id : song_id,
                title: song_title
            };

            return this;
        
        }

    }

    /**
     *
     * Aakkosittain järjestetty lista
     *
     **/
    var AlphabeticalSonglist = function(){
        this.list_type = "alpha";
        Songlist.call(this);

        /**
         *
         * Hakee kaikki käyttäjän klikkaamaan kategoriaan
         * kuuluvat laulut ja listaa ne
         *
         * @param $launcher klikkauksen laukaissut linkki
         *
         **/
        this.ListSongs = function($launcher){
            if(!$launcher.find("ul").length){
                //Vain, jos kyseessä kategorialinkki, eikä laulun nimi
                var self = this;
                $.getJSON("php/ajax/Loader.php",
                    {
                        action: "get_songs_in_list_alpha",
                        service_id: Service.GetServiceId(),
                        letter: $launcher.text().charAt(0),
                    },
                    function(data){
                        self.SetSongs(data, $launcher, self);
                    }
                );
            }
            else if($launcher.hasClass("songlist_subcat")){
                $launcher.find("ul").slideToggle();
            }
        };
    }

    /**
     *
     * Lataa kaikki selattavat kategoriat (eri listat)
     *
     */
    function LoadSongLists(){
        alphalist = alphalist || new AlphabeticalSonglist();
        alphalist.GetAndSetSubCategories();
    }

    /**
     *
     * Valmistaa laululistoihin ja sanoihin liittyvät toiminnot
     *
     * @pararm make_not_service_specific Jos kyseessä ei ole messukohtainen laululista, aseta tämä todeksi
     *
     */
    function Initialize(make_not_service_specific){
        if (make_not_service_specific){
            not_service_specific = true;
        }
        LoadSongLists();
        $("#save_lyrics").click(function(){
            var id = $("#songdetails .lyrics_id").val(),
                newtext = $("#songdetails .edited_lyrics").val();
            $("#songdetails .below_lyrics").hide();
            SaveEditedLyrics(id, newtext, $("#songdetails .lyrics"), "#songdetails .lyrics_id");
        });
        $("#prepared_for_insertion .cancel_link").click(function(){
            $("#prepared_for_insertion").hide();
            $(".covermenu-target_songlist").click();
        })
    }

    /**
     *
     * Hae liittämistä odottavan laulun nimi
     *
     **/
    function GetWaitingForAttachment(){
        return waiting_for_attachment;
    }

    /**
     *
     * Hakee laulun sanat tietokannasta
     *
     * @param id laulun id tietokannassa
     * @param $target_el jquery-elementti, johon sanat lisätään
     * @param $checkbox jätetäänkö  säkeistöjen viereiset valintalaatikot tulostamatta
     *
     */
        function SetLyrics(id, $target_el, no_checkbox){
        var split_pattern = /\n{2,}/,
            checkbox = (no_checkbox ? 
                "" : "<div><input type='checkbox' checked='yes'></input></div>");
        $target_el.html("");
        return $.getJSON("php/ajax/Loader.php",{
            action: "fetch_lyrics",
            song_id: id,
        }, function(verses){
            $.each(verses, function(idx, verse){
                var text = verse.verse.replace(/\n/g,"<br>\n");
                if (text){
                    $target_el.append(
                        `<li>
                            ${checkbox}
                            <div>${text}</div>
                        </li>`
                    );
                }
            });
            if(edited_lyrics_callback)
                edited_lyrics_callback();
        });
    
    };

    /**
     *
     * Hakee tiedot laulun tägeistä, säveltäjästä ja sanoittajasta
     *
     *
     */
    function SetSongMeta(){

        var current_slot = Portal.SongSlots.GetCurrentSlot(),
            params = {
                "action": "get_song_meta",
                "song_id": current_slot.picked_id,
            },
            tags = "";

        //Tyhjennä ensin metadata
        $("#songdetails input").val();
        $("#songdetails .data_as_text").text("");

        return $.getJSON("php/ajax/Loader.php",params,(meta) => {
            console.log(meta.tags);
            tags = meta.tags.join(", ");
            current_slot.tags = tags;
            $("#songdetails").find(".lyricsby .data_as_text").text(meta.lyrics);
            $("#songdetails").find(".composer .data_as_text").text(meta.composer);
            $("#songdetails").find(".songtags .data_as_text").text(tags);
            $("#songdetails").find(".lyricsby .data_as_input input").val(meta.lyrics);
            $("#songdetails").find(".composer .data_as_input input").val(meta.composer);
            $("#songdetails").find(".songtags .data_as_input input").val(tags);
        });

    }


    /**
     *
     * Talentaa muokatut sanat tai uuden version.
     *
     * @param id muokattavan laulun id tai nimi, jos uusi
     * @param newtext uudet sanat
     * @param $target_el jquery-elementti, johon sanat lisätään
     * @param idselector css-selektori, jolla määritetään, mihin tallennetaan tieto id:stä
     *
     */
    function SaveEditedLyrics(id, newtext, $target_el, idselector){
        var split_pattern = /\n{2,}/,
            verses = newtext.trim().split(split_pattern);
        $.get("php/ajax/Saver.php",{
            action: "save_edited_lyrics",
            song_id: id,
            newtext: verses
        }, function(saved_id){
            if (idselector){
                //Jos halutaan muuttaa jonkin elementin arvoa
                //uuden id:n mukaiseksi
                $(idselector).val(saved_id*1);
            }
            SetLyrics(saved_id*1, $target_el)
            Portal.SongSlots.GetCurrentSlot().CheckLyrics();
            LoadSongLists();
        });
    
    }

    /**
     *
     * Asettaa funktion, joka ajetaan sen jälkeen, kun sanat ladattu
     *
     */
    function SetEditedLyricsCallback(callback){
        edited_lyrics_callback = callback;
    }


    AlphabeticalSonglist.prototype = Object.create(Songlist.prototype);


    return {

        Initialize,
        GetWaitingForAttachment,
        SetLyrics,
        SetSongMeta,
        SetEditedLyricsCallback,

    };

}();
