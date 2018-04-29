/**
 *
 * Yksittäisen messun / palveluksen laulut
 *
 **/
var Songs = function(){

    var Alphalist = undefined;

    function LoadSongSlots(){
        $.get("php/ajax/Loader.php", {
            action: "get_song_slots",
            service_id: Service.GetServiceId()
            },
            function(data){
                $("#songslots").html(data);
            });
    }

    //Add song-related actions
    $(function(){
        $("#browse_songs").click(function(){
            console.log("hosing");
            $("#songlist").show();
        });
    });



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
                        <li class='subwindow-opener'>${el}</li>
                    `);
                $li.click(function(){self.ListSongs($(this))});
                self.$anchor.append($li);
            });
        }

        /**
         *
         * Listaa kaikki tämän kategorian / kirjaimen laulut
         *
         * @param songs laulujen nimet taulukkona
         * @param $launcher tapahtuman laukaissut listaelementti
         *
         **/
        this.SetSongs = function(songs, $launcher){
            console.log(songs);
            //self.$anchor.html("");
            if(!$launcher.find("ul").length){
                $ul =  $("<ul></ul>").appendTo($launcher);
                $.each(songs, function(idx, el){
                    var $li = $(`
                            <li>${el}</li>
                        `);
                    $ul.append(`<li>${el}</li>`);
                });
            }
            else{
                $launcher.find("ul").slideToggle();
            }
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
            var self = this;
            $.getJSON("php/ajax/Loader.php",
                {
                    action: "get_songs_in_list_alpha",
                    service_id: Service.GetServiceId(),
                    letter: $launcher.text().charAt(0),
                },
                function(data){
                    self.SetSongs(data, $launcher);
                }
            );
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

    AlphabeticalSonglist.prototype = Object.create(Songlist.prototype);



    return {

        LoadSongSlots,
        LoadSongLists,

    };

}();
