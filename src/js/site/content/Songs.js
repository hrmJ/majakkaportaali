/**
 *
 * Yksittäisen messun / palveluksen laulut
 *
 **/
var Songs = function(){

    function LoadSongSlots(){
        $.get("php/ajax/Loader.php", {
            action: "get_song_slots",
            service_id: Service.GetServiceId()
            },
            function(data){
                $("#songslots").html(data);
            });
    }

    return {

        LoadSongSlots,

    };

}();
