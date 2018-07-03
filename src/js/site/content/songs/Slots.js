/**
 *
 * Moduuli yhden messun laulusloteista
 *
 */
var SongSlots = function(){

    var songs_tab,
        sortable_slot_list;

    //TODO: tallenna muutokset automaattisesti, jos n minuuttia tallentamatta

    /**
     *
     * Hakee tietokannassa olevien laulujen nimet
     *
     **/
    function LoadSongTitles(request, response){
        $.getJSON("php/ajax/Loader.php",{
            action: "get_song_titles",
            service_id: Service.GetServiceId(),
            title:request.term
        }, 
            function(data){
                console.log(data);
                response(data)
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
        $.get("php/ajax/Loader.php", {
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
        console.log($slots.length);
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
        //TODO: multisongs!
        $("#songslots").html(slot_data);
        $(".slotcontainer").each(function(){
            var Cont = new SlotContainer($(this));
            Cont.SetName( $(this).find(".cont_name").text());
            Cont.SetMultisongButtons().FetchSlots();
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
            console.log("fetching.." + this.name);
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
            $.each(slots,function(idx,slot_data){
                var slot = new SongSlot(slot_data.song_title,
                    slot_data.multisong_position, self.$ul);
                slot.Create().AttachEvents();
            });
            //Finally, attach drag and drop events
            this.AddSortability();
            //Lisää välilehtiolioon muutosten tarkkailutoiminto
            this.$ul.find("input[type='text']").on("change paste keyup",songs_tab.MonitorChanges.bind(songs_tab));
        }



        /**
         *
         * Lisää järjestelymahdollisuuden konttiin, jossa monta lauluslottia
         *
         **/
        this.AddSortability = function(){
            sortable_slot_list =  sortable_slot_list || 
                new GeneralStructure.DragAndDrop.SortableList(this.$ul,
                {
                    draggables: ".songslot",
                    drop_callback: SaveSlotOrder,
                    number: ".slot-number",
                    id_class: ".slot_id",
                    idkey: "slot_id",
                    handle: ".slot_handle",
                }
                );
            sortable_slot_list.Initialize();
        };


        /**
         *
         * Lisää painikkeet, joilla voidaan lisätä tai vähentää lauluja tästä
         * "kontista"
         *
         *
         **/
        this.SetMultisongButtons = function(){
            //TODO: painikkeet yksittäisen laulun poistamiseen mistä kohtaa 
            //tahansa EIKÄ niinkään, että koko kontin lopussa miinuspainike
            //Plussapainike kylläkin
            //USE fontawesome icons?
            var $add = $(`<i class="fa fa-plus" aria-hidden="false"></i>`)
                            .click(this.AddNewSlot.bind(this));
            this.$ul.parents(".slotcontainer").append(
                $("<div class='buttons_cont'></div>").append($add)
            );

            return this;
        };


        /**
         *
         * Lisää tämän kontin alle uuden slotin
         *
         **/
        this.AddNewSlot = function(){
            var slot_no = this.$ul.find(".songinput").length;
            var slot = new SongSlot("", slot_no, this.$ul);
            slot.Create().AttachEvents();
            this.AddSortability();
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
     * @param $cont slotin sisältävä "kontti" DOMissa
     *
     **/
    var SongSlot = function(title, position, $cont){

        var self = this;
        this.title = title;
        this.position = position;
        this.$cont = $cont;
        this.song_ids = [];

        /**
         *
         * Lisää DOMiin divin, jossa varsinainen slotti on kuvattuna
         *
         */
        this.Create = function(){
            this.$div = $(`<li class="songslot no_indicator">
                <div>
                    <span  class='slot_number hidden'>${this.position}</span>
                    <input type="text" class="songinput " value="${this.title}"> 
                </div>
                <div class='slot_handle'><i class='fa fa-arrows'></i></div>
                </li>`);
            var $edit_icon = $("<div class='slot_edit'><i class='fa fa-pencil'></i></div>");
            var $remove_icon = $("<div class='slot_remove'><i class='fa fa-trash'></i></div>");
            $edit_icon.click(this.CheckDetails.bind(this)).appendTo(this.$div);
            $remove_icon.click(this.Remove.bind(this)).appendTo(this.$div);
            this.$cont.append(this.$div);
            return this;
        };


        /**
         *
         * Poistaa tämän laulun kontista
         *
         */
        this.Remove = function(){
            //..vain jos ei viimeinen
            console.log("Removing...");
        };

        /**
         *
         * Avaa ikkunan, jossa voi tarkkailla laulun yksityiskohtia ja esim. muokata sanoja
         *
         */
        this.CheckDetails = function(){
            $("#songdetails .version_cont").html("");
            if(!this.song_ids.length){
            
            }
            else if(this.song_ids.length > 1){
                //Samasta laulusta monia versioita
                this.LoadVersionPicker();
            }
            console.log(this.song_ids);
            var songname = this.$div.find(".songinput").val();
            $("#songdetails").find("h3").text(songname);
            $("#songdetails").slideDown();
        };

        /**
         *
         * Luo valintamenun, jos monta eri laulua
         *
         */
        this.LoadVersionPicker = function(){
            var i,
                $sel = $('<select><option>Valitse versio</option></select>');
            $.each(this.song_ids,function(idx,val){
                $sel.append(`<option value='${val}'>Versio ${idx+1}</option>`);
            });
            $sel.prependTo("#songdetails .version_cont").selectmenu();
        };

        /**
         *
         * Liittää tähän slottiin jonkin laulun esimerkiksi sen jälkeen, kun
         * käyttäjä on raahannnut laululistan selauksen jälkeen näytölle
         * jääneen laulun slotin päälle.
         *
         * @param drop_event  mahdollinen pudotustapahtuma, joka kuuluu lauluslotti-diviin
         *
         **/ 
        this.AttachSong = function(drop_event){
            if(drop_event){
                $("#prepared_for_insertion").hide();
                var $target = $(drop_event.target);
            }
            $target.find(".songinput").val(SongLists.GetWaitingForAttachment());
        }

        /**
         *
         * Tarkistaa, onko tämän laulun sanoja tietokannassa
         *
         **/
        this.CheckLyrics = function(ev, item){
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
            if(!song_ids.length){
                this.$div.removeClass("has_lyrics").addClass("no_lyrics");
            }
            else{
                this.$div.removeClass("no_lyrics").addClass("has_lyrics");
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

        }



        //$(`
        //<div class='songslot_info'> &#10003; Laulu on tietokannassa</div>
        //<div class='songslot_info'>Katso sanat</div>
        //`).appendTo()


    
    }



    return {
    
        LoadSongsToSlots,
    
    };

}();
