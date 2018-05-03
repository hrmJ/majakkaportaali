/**
 *
 * Yksittäisen messun / palveluksen laulut
 *
 **/
var Songs = function(){

    var Alphalist = undefined;
    var SongSlots = [];
    var waiting_for_attachment = undefined;


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
            $target.find(".songinput").val(waiting_for_attachment);
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

        //Attach a listener for autocomplete:
        //Also for 
        //https://jqueryui.com/autocomplete/#remote
        $slot_div.find(".songinput").autocomplete( {
            source: LoadSongTitles,
            minLength: 2,
            select: this.CheckLyrics.bind(this),
            }
        ).on("change paste keyup",self.CheckLyrics.bind(this));
        //cf. https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

        //Attach a listener for dropping
        $slot_div.droppable({
            drop: this.AttachSong,
                  classes: {
                    "ui-droppable-active": "songslot_waiting",
                    "ui-droppable-hover": "songslot_taking"
          },
        });


        //$(`
        //<div class='songslot_info'> &#10003; Laulu on tietokannassa</div>
        //<div class='songslot_info'>Katso sanat</div>
        //`).appendTo()



    
    }




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
         * Erottaa listasta valitun laulun, niin että se voidaan
         * liittää osaksi messua.
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
