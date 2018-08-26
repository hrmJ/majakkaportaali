Portal = Portal || {};

/**
 *
 * Moduuli yhden messun laulusloteista
 *
 */
Portal.SongSlots = function(){

    var songs_tab,
        current_slot;

    /**
     *
     * Palauttaa aktiivisen, esim. sanojen muokkausta odottavan slotin
     *
     */
    function GetCurrentSlot(){
        return current_slot;
    }

    /**
     *
     * Asettaa aktiivisen slotin
     *
     */
    function SetCurrentSlot(slot){
        current_slot = slot;
    }

    //TODO: tallenna muutokset automaattisesti, jos n minuuttia tallentamatta

    /**
     *
     * Hakee tietokannassa olevien laulujen nimet
     *
     **/
    function LoadSongTitles(request, response){
        var path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path,{
            action: "get_song_titles",
            service_id: Service.GetServiceId(),
            title:request.term
        }, 
            function(data){
                response(data)
            }
        );
    }

    /**
     *
     * Hakee tietokannasta laulujen tägit
     *
     **/
    function LoadSongTags(request, response){
        var path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path,{
            action: "get_song_tags",
            song_id: this.picked_id,
        }, 
            function(data){
                console.log(data);
                response($.ui.autocomplete.filter(
                        data, Utilities.extractLast( request.term ) ) );
            }
        );
    }


    /**
     *
     * Hakee nyt käsiteltävässä messussa käytössä olevat laulut
     *
     * @param songtab Laulut-välilehti omana olionaan
     *
     **/
    function LoadSongsToSlots(songtab){
        songs_tab = songtab;
        var path = Utilities.GetAjaxPath("Loader.php");
        $.get(path, {
            action: "get_song_slots",
            service_id: Service.GetServiceId()
            }, 
            InitializeContainers);
    }


    /**
     *
     * Tallentaa muutokset lauluslottien järjestykseen yhden "kontin" sisällä 
     *
     **/
    function SaveSlotOrder($parent_el){
        var $slots = $parent_el.find(".songslot");
        songs_tab.MonitorChanges();
    }

    /**
     *
     * Luo jokaisesta lauluslotista oma olionsa, joka kuuntelee siihen
     * liittyviä tapahtumia, kuten laulujen raahaamista.
     *
     * @param slot_data ajax-response, joka sisältää tiedot tähän messuun tallennetuista lauluista
     *
     **/
    function InitializeContainers(slot_data){
        $("#songslots").html(slot_data);
        $(".slotcontainer").each(function(){
            var Cont = new SlotContainer($(this));
            Cont.SetName( $(this).find(".cont_name").text());
            if(Cont.$div.find(".is_multi_val").val()*1){
                //Lisää useamman laulun lisäyspainikkeet vain, jos 
                //laulu määritelty usean laulun lauluksi
                Cont.is_multi = true;
            }
            Cont.SetMultisongButtons().FetchSlots();
            Cont.SetToolTip();
        });
    }

    /**
     *
     * Yhden tai useamman laulun sisältävä slotti
     * tai pikemminkin niiden  "kontti"
     *
     * @param $div kontti representaatio DOMissa
     *
     **/
    var SlotContainer = function($div){

        this.$ul = $("<ul></ul>").appendTo($div.find(".songslots"));
        this.$div = $div;
        this.sortable_slot_list = undefined;

        /**
         *
         * Asettaa nimen
         *
         * @param name asetettava nimi
         *
         */
        this.SetName = function(name){
            this.name = name;
            return this;
        };

        /**
         *
         * Hakee käikki tämän kontin sisältämät laulut
         *
         **/
        this.FetchSlots = function(){
            $.getJSON("php/ajax/Loader.php",{
                action: "load_slots_to_container",
                service_id: Service.GetServiceId(),
                cont_name: this.name
            }, this.SetSlots.bind(this));
        }

        /**
         *
         * Syöttää kontin sisältämien lauluslottien mukaisen datan paikalleen
         *
         * @param slots taulukko niistä sloteista, joita ajax-response palauttaa
         *
         **/
        this.SetSlots = function(slots){
            var self = this;
            if(!slots.length){
                //Jos ei vielä yhtään laulua määritelty
                slots = [{song_title:"",multisong_position:""}];
            }
            $.each(slots, function(idx, slot_data){
                var slot = new SongSlot(slot_data.song_title,
                    slot_data.multisong_position, 
                    self,
                    slot_data.song_id);
                slot.Create().AttachEvents().CheckLyrics();
            });
            //Finally, attach drag and drop events
            this.AddSortability();
        }



        /**
         *
         * Lisää järjestelymahdollisuuden konttiin, jossa monta lauluslottia
         *
         **/
        this.AddSortability = function(){
            this.sortable_slot_list =  this.sortable_slot_list || 
                new GeneralStructure.DragAndDrop.SortableList(this.$ul,
                {
                    draggables: ".songslot",
                    drop_callback: SaveSlotOrder,
                    number: ".slot-number",
                    id_class: ".slot_id",
                    idkey: "slot_id",
                    handle: ".slot_handle",
                    drop_accept: ".songslot"
                }
                );
            this.sortable_slot_list.Initialize();
        };

        /**
         *
         * Lisää opasteen näyttävän tapahtuman
         *
         */
        this.SetToolTip = function(){
            this.$div.find(".fa-question-circle").click(
                () => {
                    var msg = new Utilities.Message(this.$div.find(".songdescription_val").val(), this.$div);
                    msg.AddCloseButton().Show(8000);
                }
            );
        }

        /**
         *
         * Lisää painikkeet, joilla voidaan lisätä tai vähentää lauluja tästä
         * "kontista"
         *
         *
         */
        this.SetMultisongButtons = function(){
            //TODO: painikkeet yksittäisen laulun poistamiseen mistä kohtaa 
            //tahansa EIKÄ niinkään, että koko kontin lopussa miinuspainike
            //Plussapainike kylläkin
            //USE fontawesome icons?
            if (this.is_multi){
                var $add = $(`<i class="fa fa-plus" aria-hidden="false"></i>`)
                                .click(this.AddNewSlot.bind(this));
                this.$ul.parents(".slotcontainer").append(
                    $("<div class='buttons_cont'></div>").append($add)
                );
            }

            return this;
        };


        /**
         *
         * Lisää tämän kontin alle uuden slotin
         *
         **/
        this.AddNewSlot = function(){
            var slot_no = this.$ul.find(".songinput").length;
            var slot = new SongSlot("", slot_no, this);
            slot.Create().AttachEvents();
            this.AddSortability();
            //Varmista, että uuden slotin lisääminen lasketaan muutokseksi
            songs_tab.MonitorChanges();
        };


        /**
         *
         * Poistaa tämän kontin alta slotin
         *
         * @param ...?
         *
         **/
        this.RemoveSlot = function(){
            


        };

    };


    /**
     *
     * Yksi lauluslotti, joka kuvaa esim. alkulaulua tai yhtä
     * ylistyslauluista
     *
     * @param title valitun laulun nimi (jos joku laulu jo valittu)
     * @param position valitun laulun järjestysnumero tässä "kontissa"
     * @param cont slotin sisältävä "kontti" SlotContainer-oliona
     * @param picked_id valitun laulun id (jos joku laulu jo valittu)
     *
     **/
    var SongSlot = function(title, position, cont, picked_id){

        var self = this;
        this.title = title;
        this.tags = "";
        this.position = position;
        this.picked_id = picked_id || '';
        this.cont = cont;
        this.song_ids = [];
        this.$lyrics = undefined;
        this.newsongtext = "";
        this.is_service_specific = true;

        /**
         *
         * Tekee slotista ei-messukohtaisen (jos hallitaan lauluja muualta)
         *
         */
        this.SetNotServiceSpecific = function(){
            this.is_service_specific = false;
        }

        /**
         *
         * Lisää DOMiin divin, jossa varsinainen slotti on kuvattuna
         *
         */
        this.Create = function(){
            this.$div = $(`
                <li class="songslot no_indicator">
                <div>
                    <span  class='slot_number hidden'>${this.position}</span>
                    <input type="text" class="songinput" value="${this.title}"> 
                    <input type="hidden" class="song_id" value="${this.picked_id}"> 
                </div>
                </li>`),
                $edit_icon = $("<div class='slot_edit'><i class='fa fa-pencil'></i></div>"),
                $remove_icon = $("<div class='slot_remove'><i class='fa fa-trash'></i></div>");

            if (this.cont.is_multi){
                this.$div.append("<div class='slot_handle'><i class='fa fa-arrows'></i></div>");
            }

            $edit_icon.click(this.CheckDetails.bind(this)).appendTo(this.$div);

            if (this.cont.is_multi){
                $remove_icon.click(this.Remove.bind(this)).appendTo(this.$div);
            }

            this.$div.find(".songinput").droppable({
                accept: "#prepared_for_insertion",
                drop: this.AcceptDroppedSong.bind(this),
                classes: {
                    "ui-droppable-active": "slot_waiting",
                    "ui-droppable-hover": "slot_recieve",
                }
            });
            this.cont.$ul.append(this.$div);
            //Lisää välilehtiolioon muutosten tarkkailutoiminto
            this.$div.find("input[type='text']").on("change paste keyup",
                songs_tab.MonitorChanges.bind(songs_tab));
            return this;
        };


        /**
         *
         * Ottaa laulun arvon raahatusta elementistä
         *
         */
        this.AcceptDroppedSong = function(e, ui){
            this.$div.find(".songinput").val(
                    $(ui.draggable).find(".song_title").text()
                );
            this.$div.find(".song_id").val(
                    $(ui.draggable).find(".song_id").val()
                );
            $("#prepared_for_insertion").hide();
            this.picked_id = $(ui.draggable).find(".song_id").val();
            this.CheckLyrics();
            songs_tab.MonitorChanges();
        };


        /**
         *
         * Poistaa tämän laulun kontista
         *
         */
        this.Remove = function(){
            //..vain jos ei viimeinen
            var has = {
                    next: this.$div.next().next().hasClass("songslot"),
                    prev: this.$div.prev().prev().hasClass("songslot")
            };

            if(this.$div.parents("ul").find(".songslot").length > 1){
                if(has.next && has.prev || has.next){
                    this.$div.next().remove();
                }
                else if (has.prev){
                    this.$div.prev().remove();
                }
                this.$div.remove();
                songs_tab.MonitorChanges();
            }
            else{
                window.alert("Et voi poistaa viimeistä laulua. Jos tätä laulua ei lauleta, jätä kenttä vain tyhjäksi.");
            }
        };


        /**
         *
         * Muokkaa olemassaolevia sanoja
         *
         */
        this.EditWords = function(){
            $("#songdetails .lyrics_id").val(this.picked_id);
            $.getJSON("php/ajax/Loader.php",{
                action: "fetch_lyrics",
                song_id: this.picked_id,
            }, function(verses){
                var text = "";
                $.each(verses, function(idx, verse){
                    text += "\n\n" + verse.verse;
                });
                $("#songdetails .below_lyrics").show();
                $("#songdetails .lyrics")
                    .html("")
                    .append(`<textarea class='edited_lyrics'>${text.trim()}</textarea>`);
            });
        };


        /**
         *
         * Lisää uuden version tästä laulusta
         *
         */
        this.AddNewVersion = function(){
            $("#songdetails .below_lyrics").show();
            $("#songdetails .lyrics_id").val(this.title);
            $("#songdetails .lyrics")
                .html("")
                .append(`<textarea class='edited_lyrics'></textarea>`);
        };


        /**
         *
         * Avaa ikkunan, jossa voi tarkkailla laulun yksityiskohtia ja esim. muokata sanoja
         *
         */
        this.CheckDetails = function(){
            //Käytä oletuksena ensimmäistä versiota ko. laulusta
            var self = this;
            this.picked_id = this.picked_id || this.song_ids[0];
            //If no $div set, use the original title
            // -- this means we're using a pseudo-songslot
            // launched by e.g.  a songlist
            this.title = (this.$div ? this.$div.find(".songinput").val() : this.title);

            SetCurrentSlot(this);

            $("#songdetails").find(".version_cont, .lyrics").html("");
            SongLists.SetLyrics(this.picked_id, $("#songdetails .lyrics"));
            SongLists.SetSongMeta();

            this.PrintEditActions();
            $("#songdetails").find("h3").text(this.title);
            $("#songdetails").find(".song_id").val(this.picked_id);
            $("#songdetails").slideDown();
            //Varmista, että uusien sanojen tallennuksen jälkeen pystytään viittaamaan

            //Varmista, että versiot päivitetään 
            //asettamalla callback
            SongLists.SetEditedLyricsCallback(function(){
                var input_id_val = $("#songdetails .lyrics_id").val();
                self.picked_id = input_id_val || self.picked_id;
                if(this.is_service_specific){
                    $.when(self.RefreshVersions(
                        self.LoadVersionPicker.bind(self)
                    )).done(self.PrintEditActions.bind(self));
                }
            });
        };

        /**
         *
         * Lisää toiminnallisuuden laulun tarkasteluikkunaan
         *
         *
         */
        this.PrintEditActions = function(){
            var lyrics_status = (this.song_ids.length ? "has_lyrics" : "no_lyrics"),
                edit_actions = {
                    no_lyrics : [
                        $(`<li class='new_version_li'>
                        Lisää lauluun sanat</li>`)
                            .click(self.AddNewVersion.bind(self))
                    ],
                    has_lyrics: [
                        $(`<li class='edit_words_li'>Muokkaa sanoja</li>`)
                            .click(self.EditWords.bind(self)),
                        $(`<li class='new_version_li'>
                        Lisää uusi laulu tai versio samalla nimellä </li>`)
                            .click(self.AddNewVersion.bind(self))
                    ]
                };
            if(!this.is_service_specific){
                lyrics_status = "has_lyrics";
            }
            $("#songdetails_actions").html("");
            $.each(edit_actions[lyrics_status],function(idx, $el){
                $("#songdetails_actions").append($el);
            });

            $("#songdetails .edit_icon").unbind("click").click(this.EditMeta.bind(this));
        }

        /**
         *
         * Muokkaa laulun säveltäjää / sanoittajaa / tägejä
         *
         * TODO: abstraktimman tason muokkausfunktio tai -metodi
         *
         * @paramev klikkaustapahtuma
         *
         */
        this.EditMeta = function(ev){
            var $li = $(ev.target).parents("li"),
                path = Utilities.GetAjaxPath("Saver.php"),
                loadpath = Utilities.GetAjaxPath("Loader.php"),
                meta_type = $li.attr("class");
                new_val = $li.find(".data_as_input input").val();

            if(meta_type == "songtags"){
                //Pilkuilla erotettu multiautocomplete tägeille
                $(".taginput").autocomplete({
                        source: LoadSongTags,
                        minLength: 2,
                        focus: () => false,
                        select: function(event, ui) {
                          var terms = Utilities.split( this.value );
                          terms.pop();
                          terms.push( ui.item.value );
                          terms.push("");
                          this.value = terms.join( ", " );
                          return false;
                        }
                        });

                //Jaa tägitekstikentän sisältö taulukoksi
                new_val = new_val.split(/, ?/).filter((v)=>v != "");
            }
            else{
                //Yksinkertainen autocomplete säveltäjällä ja sanoittajalle
                $li.find(".data_as_input input").autocomplete({
                    source: (request, response) => {
                        $.getJSON(loadpath, {
                            "action" : "get_authors",
                            "authorstring" : request.term
                        }, (data) => response(data))
                    }
                });
            }


            if($li.find(".edit_icon").hasClass("fa-pencil")){
                //Jos  aloitetaan muokkaus
                $li.find(".data_as_text").hide()
                $li.find(".data_as_input").show()
                $li.find(".edit_icon").removeClass("fa-pencil").addClass("fa-check");
            }
            else{
                //Jos lopetetaan muokkaus
                $.post(path, {
                    "action": "save_edited_meta",
                    "new_val": new_val,
                    "meta_type": meta_type,
                    "song_id": this.picked_id
                
                }, () => {
                    $li.find(".data_as_input").hide();
                    $li.find(".data_as_text")
                        .text($li.find(".data_as_input input").val())
                        .show();
                    $li.find(".edit_icon").removeClass("fa-check").addClass("fa-pencil");
                }
                );
            }
        }


        /**
         *
         * Päivittää laulusta saatavilla olevat versiot
         *
         */
        this.RefreshVersions = function(callback){
            var self = this;
            return $.getJSON("php/ajax/Loader.php",{
                    action:  "check_song_title",
                    service_id: Service.GetServiceId(),
                    title: this.title
                    },
                function(ids){
                   self.song_ids = ids;
                    if(callback) 
                        callback();
                });
                    //callback.bind(this));
        }

        /**
         *
         * Luo valintamenun, jos monta eri laulua
         *
         */
        this.LoadVersionPicker = function(){
            if(this.song_ids.length > 1){
                var i,
                    $sel = $('<select class="version_picker_select"></select>');
                $("#songdetails .version_picker_select").remove();
                $.each(this.song_ids,function(idx,val){
                    $sel.append(`<option value='${val}'>Versio ${idx+1}</option>`);
                });
                $sel.prependTo("#songdetails .version_cont").selectmenu();
                $sel.on("selectmenuchange", self.SetVersion.bind(this));
                $sel.val(this.picked_id).selectmenu("refresh");
            }
        };

        /**
         *
         * Vaihtaa käytössä olevan version
         *
         * @param e tapahtuma
         * @param itm jquery-ui:n selectmenusta valittu elementti
         *
         */
        this.SetVersion = function(e, itm){
            this.picked_id = itm.item.value;
            $("#songdetails .lyrics_id").val(this.picked_id);
            this.$div.find(".song_id").val(this.picked_id);
            SongLists.SetLyrics(this.picked_id, $("#songdetails .lyrics"));
            songs_tab.MonitorChanges();
        }


        /**
         *
         * Tarkistaa, onko tämän laulun sanoja tietokannassa
         *
         **/
        this.CheckLyrics = function(ev, item){
            if(this.is_service_specific){
                var self = this;
                //Jos käynnistetty klikkaamalla autocomplete-listaa, käytä sen arvoa
                var title = (item ? item.item.value :  this.$div.find(".songinput:eq(0)").val());
                $.getJSON("php/ajax/Loader.php",{
                        action:  "check_song_title",
                        service_id: Service.GetServiceId(),
                        title: title
                        },
                        self.IndicateLyrics.bind(self)
                        );
            }
        };



        /**
         *
         *
         * Näyttää informaation siitä, onko laulun sanoja tietokannassa. Lisää
         * myös tiedon niistä laulujen id:istä, jotka valitulla laulun nimellä
         * löytyvät.
         *
         * TODO: mahdollisuus klikata yksityiskohtaikkunasta vahvistus sille,
         * että tähän ei tule sanoja.
         *
         * @param song_ids id:t niistä lauluista, joita löydettiin
         *
         **/
        this.IndicateLyrics = function(song_ids){
            this.song_ids = song_ids;
            this.$div.removeClass("no_indicator");
            if(!this.picked_id){
                //Valitse oletuksena versioista ensimmäinen
                this.$div.find(".song_id").val(song_ids[0]);
                this.picked_id = song_ids[0];
            }
            else{
                //Muutoin käytä määriteltyä
                this.$div.find(".song_id").val(this.picked_id);
            }

            if(!song_ids.length){
                this.$div.removeClass("has_lyrics").addClass("no_lyrics");
                this.song_ids = [];
                this.picked_id = null;
            }
            else{
                this.$div.removeClass("no_lyrics").addClass("has_lyrics");
            }

            if(!this.$div.find(".songinput").val()){
                //Älä ota huomioon tyhjiä slotteja
                this.$div
                    .removeClass("no_lyrics")
                    .removeClass("has_lyrics")
                    .addClass("no_indicator");
            }
        };

        /** 
         * Liittää lauluslottiin kuuluvat tapahtumat
         *
         **/
        this.AttachEvents = function(){
            this.$div.find(".songinput").autocomplete( {
                source: LoadSongTitles,
                minLength: 2,
                select: this.CheckLyrics.bind(this)
                }
            ).on("change paste keyup",self.CheckLyrics.bind(this));

            return this;

        }



        //$(`
        //<div class='songslot_info'> &#10003; Laulu on tietokannassa</div>
        //<div class='songslot_info'>Katso sanat</div>
        //`).appendTo()


    
    }



    return {
    
        LoadSongsToSlots,
        SongSlot,
        LoadSongTitles,
        GetCurrentSlot
    
    };

}();
