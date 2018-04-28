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

    //Add song-related actions
    $(function(){
        $("#browse_songs").click(function(){
            console.log("hosing");
            $("#songlist").show();
        });
    });

    return {

        LoadSongSlots,

    };

}();
