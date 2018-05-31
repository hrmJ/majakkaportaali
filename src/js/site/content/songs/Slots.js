/**
 *
 * Moduuli yhden messun laulusloteista
 *
 **/
var SongSlots = function(){


    /**
     *
     * Hakee tietokannassa olevien laulujen nimet
     *
     **/
    function LoadSongTitles(request, response){
        console.log("test..");
        $.getJSON("php/ajax/Loader.php",{
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
     * Hakee nyt käsiteltävässä messussa käytössä olevat laulut
     *
     **/
    function LoadSongsToSlots(){
        $.get("php/ajax/Loader.php", {
            action: "get_song_slots",
            service_id: Service.GetServiceId()
            }, 
            InitializeContainers);
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
            Cont.FetchSlots();
            var slot  = new SongSlot($(this));
            //slot.AttachEvents();
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

        this.$div = $div;

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
            console.log("fetching..");
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
            $.each(slots,function(idx,slot){
                var slot = new SongSlot(slot.song_title,
                    slot.multisong_position, self.$div);
                slot.Create().AttachEvents();
            });
        }

        /**
         *
         * Lisää painikkeet, joilla voidaan lisätä tai vähentää lauluja tästä
         * "kontista"
         *
         *
         **/
        this.SetMultisongButtons = function(){
            //USE fontawesome icons?
            var $add = $("");
            var $remove = $("");
            this.$div.after($("<div class='buttons_cont'></div>")
                .append($add).append($remove));
            var self = this;
            $.each(slots,function(idx,slot){
                var slot = new SongSlot(slot.song_title,
                    slot.multisong_position, self.$div);
                slot.Create().AttachEvents();
            });
        }



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

        /**
         *
         * Lisää DOMiin divin, jossa varsinainen slotti on kuvattuna
         *
         **/
        this.Create = function(){
            this.$div = $(`<div>
                <input type="hidden" class=" " value="${this.position}"> 
                <input type="text" class="songinput " value="${this.title}"> 
                </div>`);
            this.$cont.append(this.$div);
            return this;
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
        this.CheckLyrics = function(){
            var self = this;
            var title = this.$div.find(".songinput:eq(0)").val();
            $.getJSON("php/ajax/Loader.php",{
                    action:  "check_song_title",
                    service_id: Service.GetServiceId(),
                    title: title
                    },
                    self.IndicateLyrics
                    );
        };

        /**
         *
         *
         * Tulostaa informaation siitä, onko laulun sanoja tietokannassa
         *
         * @param data getJSON-funktiolta saatu response
         *
         **/
        this.IndicateLyrics = function(data){
        
            console.log(data);
        
        };

        /**
         *
         * Liittää lauluslottiin kuuluvat tapahtumat
         *
         **/
        this.AttachEvents = function(){
            this.$div.find(".songinput").autocomplete( {
                source: LoadSongTitles,
                minLength: 2,
                select: this.CheckLyrics.bind(this),
                }
            ).on("change paste keyup",self.CheckLyrics.bind(this));

            //Attach a listener for dropping
            console.log("Attaching droppability...");
            this.$div.droppable({
                drop: this.AttachSong,
                      classes: {
                        "ui-droppable-active": "songslot_waiting",
                        "ui-droppable-hover": "songslot_taking"
              },
            });
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
