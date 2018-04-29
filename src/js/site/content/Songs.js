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
                        <li>${el}</li>
                    `);
                self.$anchor.append($li);
            });
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

        this.InitializeSubCategories = function(data){
        }
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
