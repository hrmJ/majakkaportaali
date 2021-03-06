Portal = Portal || {};

/**
 *
 * Moduuli yhden messun laulusloteista
 *
 */
Portal.SongSlots = function(){

    var current_slot;

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
            service_id: Portal.Service.GetServiceId(),
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
                response($.ui.autocomplete.filter(
                        data, Utilities.extractLast( request.term ) ) );
            }
        );
    }


    /**
     *
     * Hakee nyt käsiteltävässä messussa käytössä olevat laulut
     *
     */
    function LoadSongsToSlots(){
        var path = Utilities.GetAjaxPath("Loader.php");
        $.get(path, {
            action: "get_song_slots",
            service_id: Portal.Service.GetServiceId()
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
        Portal.Service.GetCurrentTab("Songs").MonitorChanges();
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
            Cont.restrictedto = Cont.$div.find(".restriction_val").val();
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
        this.restrictionlist = [];

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
                service_id: Portal.Service.GetServiceId(),
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
                    slot_data.song_id,
                    slot_data.verses,
                    slot_data.is_instrumental,
                    );
                slot.Create().AttachEvents();
                if(!self.restrictedto){
                    slot.CheckLyrics();
                }
            });
            //Finally, attach drag and drop events
            if(this.is_multi){
                this.AddSortability();
            }
            else{
                this.$div.find(".cont_name").css({"margin-bottom":"0.7em"});
            }
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
            Portal.Service.GetCurrentTab("Songs").MonitorChanges();
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
    var SongSlot = function(title, position, cont, picked_id, verses, is_instrumental){

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
        this.verses = verses || '';
        this.is_instrumental = is_instrumental || 'no';

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
         * Merkitsee laulu instrumentaaliseksi (ei lisätä sanoja)
         *
         */
        this.MarkNoWords = function(){
            var $cb = $("#songdetails [name='no_lyrics_cb']");
            if($cb.is(":checked")){
                this.$div.find(".is_instrumental").val("yes");
            }
            else{
                this.$div.find(".is_instrumental").val("no");
            }
            Portal.Service.GetCurrentTab("Songs").MonitorChanges();
        };


        /**
         *
         * Merkitsee, mitkä säkeistöt kappaleesta halutaan messussa
         * laulaa. Oletuksena kaikki, mutta poistamalla
         * ruksin säkeistön edestä voidaan myös jättää säkeistöjä pois.
         *
         */
        this.MarkUsedVerses = function(){
            var used_verses = [];
            $("#songdetails .lyrics input[type='checkbox']").each(function(){
               if( $(this).is(":checked")){
                   used_verses.push($(this).parents("li:eq(0)").index()+1);
               }
            });
            this.$div.find(".verses").val(used_verses.join(","));
            Portal.Service.GetCurrentTab("Songs").MonitorChanges();
        }

        /**
         *
         * Lisää DOMiin divin, jossa varsinainen slotti on kuvattuna
         *
         */
        this.Create = function(){
            var promise = undefined,
                path = Utilities.GetAjaxPath("Loader.php"),
                self = this;
            this.$div = $(`
                <li class="songslot no_indicator">
                <div>
                    <span  class='slot_number hidden'>${this.position}</span>
                    <input type="text" class="songinput" value="${this.title}"> 
                    <input type="hidden" class="song_id" value="${this.picked_id}"> 
                    <input type="hidden" class="verses" value="${this.verses}"> 
                    <input type="hidden" class="is_instrumental" value="${this.is_instrumental}"> 
                </div>
                </li>`);

            //Varmista, että slotti on merkitty valituksi, kun siihen kosketaan
            this.$div.click(()=>{ SetCurrentSlot(self); });

            //Laulujen lisävalinnat: monta laulua samassa / rajattu tägillä
            if (this.cont.is_multi){
                $("<div class='slot_handle'><i class='fa fa-arrows'></i></div>")
                    .appendTo(this.$div);
            }



            $("<div class='slot_edit'><i class='fa fa-pencil'></i></div>")
                .click(this.CheckDetails.bind(this))
                .appendTo(this.$div);

            if (this.cont.is_multi){
                //Lisää lisävalintoja: poistaminen
                $("<div class='slot_remove'><i class='fa fa-trash'></i></div>")
                    .click(this.Remove.bind(this))
                    .appendTo(this.$div);
            }


            this.$div.find("[type='text'].songinput").droppable({
                accept: "#prepared_for_insertion",
                drop: this.AcceptDroppedSong.bind(this),
                classes: {
                    "ui-droppable-active": "slot_waiting",
                    "ui-droppable-hover": "slot_recieve",
                }
            });

            this.cont.$ul.append(this.$div);

            if(this.cont.restrictedto){
                // Jos käytössä (johonkin tägiin) rajattu lista lauluja
                this.$div.find(".songinput").remove();
                //this.$div.find("div").css({"padding-top":"1em"});
                //this.$div.find("div").append();
                promise = $.getJSON(path, {
                    "action" : "get_songs_with_tag",
                    "tag": this.cont.restrictedto
                }, (songs) => {
                    var $sel = $("<select class='songinput'></select>"),
                        uniquetitles = [],
                        uniquesongs = [];
                    //Tallenna tällä hetkellä tägätyt laulut, jotta voidaan tarvittaessa lisätä uusi
                    this.cont.restrictionlist = songs.map((s) => s.id);

                    $.each(songs, (sidx,this_song)=>{
                        if(uniquetitles.indexOf(this_song.title) == -1){
                            uniquetitles.push(this_song.title);
                            uniquesongs.push(this_song);
                        }
                    });
                    songs = uniquesongs;
                    $sel
                        .append("<option value=''>Valitse</option>")
                        .append(songs.map((s) => `<option>${s.title}</option>`))
                        .append("<option>Jokin muu</option>")
                        .appendTo(this.$div.find("div:eq(0)"));
                    $sel.select_withtext({
                        select: () => {
                            this.picked_id = null;
                            this.CheckLyrics.bind(this)();
                            Portal.Service.GetCurrentTab("Songs")
                                .MonitorChanges.bind(
                                    Portal.Service.GetCurrentTab("Songs")
                                )();
                        }
                    });
                    $sel.val(this.title);
                    $sel.select_withtext("refresh");
                    this.CheckLyrics();
                });
            }

            $.when(promise).done(() => {
                //Lisää välilehtiolioon muutosten tarkkailutoiminto.
                //Tämä suoritetaan joko heti tai kun tägillä rajatut laulut on ajettu sisään:
                this.$div.find("input[type='text'], select").on("change paste keyup selectmenuchange",
                    Portal.Service.GetCurrentTab("Songs")
                        .MonitorChanges.bind(Portal.Service.GetCurrentTab("Songs")));
            });


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
            Portal.Service.GetCurrentTab("Songs").MonitorChanges();
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
                Portal.Service.GetCurrentTab("Songs").MonitorChanges();
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
         * @param ev klikkaustapahtuma
         *
         */
        this.CheckDetails = function(ev){
            //HACK: replace with a more robust
            $("#songdetails .closer_div a").click(() => {
                SongLists.SetEditedLyricsCallback(undefined);
            })
            var self = this;
            //Käytä oletuksena ensimmäistä versiota ko. laulusta
            this.picked_id = this.picked_id || this.song_ids[0];
            //If no $div set, use the original title
            // -- this means we're using a pseudo-songslot
            // launched by e.g.  a songlist
            this.title = (this.$div ? this.$div.find(".songinput").val() : this.title);
            if(!this.title){
                //Jos tyhjä, älä tee mitään
                return 0;
            }


            SetCurrentSlot(this);

            $("#songdetails").find(".version_cont, .lyrics").html("");
            $.when(
                SongLists.SetLyrics(this.picked_id, $("#songdetails .lyrics"))
            ).done(()=>{
            
                $("body").scrollTo("#songdetails",100);

                if(!Portal.Menus.menus.songlist.last_action){
                    Portal.Menus.menus.songdetails.action_before_menu = $(ev.target);
                }

                SongLists.SetSongMeta();
                this.PrintEditActions();
                //TODO: Piilota ennemmin menu-moduulin kautta?
                //$(".covermenu").hide()
                $("#songdetails").find("h3").text(this.title);
                $("#songdetails").find(".song_id").val(this.picked_id);
                //Sulje laulujen lista, jos käynnistetty sitä kautta
                Portal.Menus.menus.songdetails.OpenMenu();
                Portal.Menus.menus.songlist.CloseMenu();
                //Varmista, että uusien sanojen tallennuksen jälkeen pystytään viittaamaan

                if(this.is_service_specific){
                    $("#songdetails .edit_instructions").show();
                    $("#songdetails .edit_instructions h4").click(Portal.Menus.InitializeFoldMenu);
                }

                this.LoadVersionPicker();
                //Varmista, että versiot päivitetään 
                //asettamalla callback
                SongLists.SetEditedLyricsCallback(() => {
                    var input_id_val = $("#songdetails .lyrics_id").val();
                    this.picked_id = input_id_val || this.picked_id;
                    if(this.is_service_specific){
                        $.when(this.RefreshVersions(
                            this.LoadVersionPicker.bind(this)
                        )).done(this.PrintEditActions.bind(this));
                    }
                });
            
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
                            .click(this.AddNewVersion.bind(this)),

                        $(`<li class='nolyrics_li'> 
                            <input name='no_lyrics_cb' type="checkbox"></input>
                            Ei sanoja tähän lauluun (esitysbiisi tms.)</li>`).click(this.MarkNoWords.bind(this))
                    ],
                    has_lyrics: [
                        $(`<li class='edit_words_li'>Muokkaa sanoja</li>`)
                            .click(this.EditWords.bind(this)),
                        $(`<li class='new_version_li'>
                        Lisää uusi laulu tai versio samalla nimellä </li>`)
                            .click(this.AddNewVersion.bind(this))
                    ]
                };
            if(!this.is_service_specific){
                lyrics_status = "has_lyrics";
            }
            $("#songdetails_actions").html("");
            $.each(edit_actions[lyrics_status],(idx, $el) => {
                $("#songdetails_actions").append($el);
            });

            $("#songdetails .edit_icon").unbind("click").click(this.EditMeta.bind(this));

            if(lyrics_status == "no_lyrics"){
                $("#songdetails .song_authors, #songdetails .edit_instructions").hide();
                if(this.$div.find(".is_instrumental").val() == "yes"){
                    $("#songdetails [name='no_lyrics_cb']").get(0).checked = true;
                }
            }
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
                meta_type = $li.attr("class"),
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
                    service_id: Portal.Service.GetServiceId(),
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
            Portal.Service.GetCurrentTab("Songs").MonitorChanges();
        }


        /**
         *
         * Tarkistaa, onko tämän laulun sanoja tietokannassa
         *
         **/
        this.CheckLyrics = function(ev, item){
            if (ev) { 
                // Jos käynnistetty tapahtumasta, nollaa oletuksena id
                this.picked_id = null;
            }
            if(this.is_service_specific){
                var self = this,
                    //Jos käynnistetty klikkaamalla autocomplete-listaa (tai selectmenua), käytä sen arvoa
                    title = (item ? item.item.value :  this.$div.find(".songinput:eq(0)").val());
                if(title){
                    title = title.trim();
                    $.getJSON("php/ajax/Loader.php",{
                            action:  "check_song_title",
                            service_id: Portal.Service.GetServiceId(),
                            title: title.trim() // <-- Huom: varmista, ettei hylkää biisin nimeä, jos lopussa väli
                            },
                            self.IndicateLyrics.bind(self)
                            );
                }
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
            var path = Utilities.GetAjaxPath("Saver.php");
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

            if(this.cont.restrictedto){
                //Jos kyseessä tägein rajattu laululista
                //varmista, onko syötetty uusi laulu
                //ja jos uusi, lisää tähän lauluun tägi
                if(this.cont.restrictionlist.indexOf(song_ids[0]) == -1){
                    $.post(path,{
                        "action": "add_new_tag",
                        "tag": this.cont.restrictedto,
                        "id": song_ids[0]
                    }, (d) => this.cont.restrictionlist.push(song_ids[0]));
                }
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

    
    }



    return {
    
        LoadSongsToSlots,
        SongSlot,
        LoadSongTitles,
        GetCurrentSlot
    
    };

}();
