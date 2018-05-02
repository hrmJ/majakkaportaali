/**
 *
 * Yksittäisen messun / palveluksen laulut
 *
 **/
var Songs = function(){

    var Alphalist = undefined;
    var SongSlots = [];
    var waiting_for_attachment = undefined;

    function LoadSongSlots(){
        $.get("php/ajax/Loader.php", {
            action: "get_song_slots",
            service_id: Service.GetServiceId()
            },
            function(data){
                $("#songslots").html(data);
                InitializeSlots();
            });
    }

    /**
     *
     * Yksi lauluslotti, joka kuvaa esim. alkulaulua tai yhtä
     * ylistyslauluista
     *
     * @param $slot_div laulun sisältävä laatikko
     *
     **/
    var SongSlot = function($slot_div){

        var self = this;



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
            //waiting_for_attachment
            if(drop_event){
                $("#prepared_for_insertion").hide();
                var $target = $(drop_event.target);
            }
            $target.find(".songinput").val(waiting_for_attachment);
        }


        /**
         *
         * Tarkistaa, onko tämän laulun sanoja tietokannassa
         *
         **/
        this.CheckLyrics = function(){
        
        
        }

        //Attach a listener for autocomplete:
        //https://jqueryui.com/autocomplete/#remote
        $slot_div.find(".songinput").autocomplete(
            source: ,
            minLength: 2,
            select:,
        );

        //Attach a listener for dropping
        $slot_div.droppable({
            drop: this.AttachSong,
                  classes: {
                    "ui-droppable-active": "songslot_waiting",
                    "ui-droppable-hover": "songslot_taking"
          },
        });



    
    }




    /**
     * Lista, josta käyttäjä näkee kaikki selattavissa olevat laulut
     *
     **/
    var Songlist = function(){

        this.$anchor = $("#songlist_" + this.list_type);

        /**
         *
         * Fetch the subcategories from the database
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
         * Add the subcategories as a list
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
            $ul = $("<ul></ul>").appendTo($launcher);
            $.each(songs, function(idx, el){
                var $li = $(`
                        <li>${el}</li>
                    `);
                $li.on("hover",function(){console.log("haa")});
                $li.click(function(e){
                    e.stopPropagation();
                    self.PrepareSongForInsertion($(this));
                });
                $ul.append($li);
            });
        };


        /**
         *
         * Erotta listasta valitun laulun, niin että se voidaan
         * liitää osaksi messua.
         *
         * @param $launcher tapahtuman laukaissut laulu
         *
         **/
        this.PrepareSongForInsertion = function($launcher){
            waiting_for_attachment =  $launcher.text();
            $("#songlist").hide();
            $(".blurcover").remove();
            $("#prepared_for_insertion").show()
                .find("h4").text(waiting_for_attachment);
        };

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
     * Lataa kaikki selattavat kategoriat
     *
     **/
    function LoadSongLists(){
        Alphalist = new AlphabeticalSonglist();
        Alphalist.GetAndSetSubCategories();
    }

    /**
     *
     * Luo jokaisesta lauluslotista oma olionsa, joka kuuntelee
     *
     **/
    function InitializeSlots(){
        $(".songslot").each(function(){
            SongSlots.push(new SongSlot($(this)));
        });
    }

    AlphabeticalSonglist.prototype = Object.create(Songlist.prototype);


    return {

        LoadSongSlots,
        LoadSongLists,
        InitializeSlots,

    };

}();
