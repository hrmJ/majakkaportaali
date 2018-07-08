/**
 *
 * Moduuli erilaisille laulujen selauslistoille
 *
 *
 */
var SongLists = function(){

    var waiting_for_attachment = undefined;

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
     * Lataa kaikki selattavat kategoriat (eri listat)
     *
     **/
    function LoadSongLists(){
        var alphalist = new AlphabeticalSonglist();
        alphalist.GetAndSetSubCategories();
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
     * @param targetselector css-selektori, jolla paikannetaan se kohta, johon sanat lisätään.
     *
     */
    function SetLyrics(id, targetselector){
        var split_pattern = /\n{2,}/;
        $(targetselector).html("");
        $.getJSON("php/ajax/Loader.php",{
            action: "fetch_lyrics",
            song_id: id,
        }, function(versetext){
            if (versetext.verses){
                versetext = versetext.verses;
            }
            verses = versetext.trim().split(split_pattern);
            $.each(verses, function(idx, verse){
                if (verse){
                    $(targetselector).append(`<p>${verse}</p>`);
                }
            });
        });
    
    };


    AlphabeticalSonglist.prototype = Object.create(Songlist.prototype);


    return {

        LoadSongLists,
        GetWaitingForAttachment,
        SetLyrics

    };

}();
