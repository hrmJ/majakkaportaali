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
            InitializeSlots);
    }


    /**
     *
     * Luo jokaisesta lauluslotista oma olionsa, joka kuuntelee siihen
     * liittyviä tapahtumia, kuten laulujen raahaamista.
     *
     * @param slot_data ajax-response, joka sisältää tiedot tähän messuun tallennetuista lauluista
     *
     **/
    function InitializeSlots(slot_data){
        //TODO: multisongs!
        $("#songslots").html(slot_data);
        $(".slotcontainer").each(function(){
            var Cont = new SlotContainer();
            Cont.SetName( $(this).find(".cont_name").text());
            Cont.FetchSlots();
            var slot  = new SongSlot($(this));
            slot.AttachEvents();
        });
    }

    /**
     *
     * Yhden tai useamman laulun sisältävä slotti
     * tai pikemminkin niiden  "kontti"
     *
     * @param $slot_div yhden laulun sisältävä div
     *
     **/
    var SlotContainer = function(){

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
            console.log(slots);
        }

    };


    /**
     *
     * Yksi lauluslotti, joka kuvaa esim. alkulaulua tai yhtä
     * ylistyslauluista
     *
     * @param $slot_div yhden laulun sisältävä div
     *
     **/
    var SongSlot = function($slot_div){

        var self = this;
        this.$slot = $slot_div;



        /**
         *
         * Liittää tähän slottiin jokin laulu esimerkiksi sen jälkeen, kun
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
            var title = this.$slot.find(".songinput:eq(0)").val();
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

        this.AttachEvents = function(){
            //Attach a listener for autocomplete:
            //Also for 
            //https://jqueryui.com/autocomplete/#remote
            this.$slot.find(".songinput").autocomplete( {
                source: LoadSongTitles,
                minLength: 2,
                select: this.CheckLyrics.bind(this),
                }
            ).on("change paste keyup",self.CheckLyrics.bind(this));
            //cf. https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

            //Attach a listener for dropping
            console.log("Attaching droppability...");
            this.$slot.droppable({
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
