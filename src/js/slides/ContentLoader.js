var Slides = Slides || {};

/**
 *
 *
 * Moduuli, joka vastaa sisällön lataamisesta.
 *
 *
 */
Slides.ContentLoader = function(){


    /**
     *
     * Lisää kaikki kauden messut select-elementtiin, josta käyttäjä voi 
     * valita haluamansa päivän messun.
     *
     * @param services ajax-vastauksena saatu messujen lista muodossa [{"servicedate":xxx,"teme":...}]
     *
     */
    function AddServicesToSelect(services){
        var $sel = $("#service-select");
        $sel.find("option:gt(0)").remove();
        $sel.append(
            services.map((service) =>  
            `<option value='${service.id}'>${service.servicedate} </option>`)
            );
    }

    /**
     * Lataa näkyville listan messun vastuuhenkilöistä
     *
     * @param int id sen messun id, jonka tietoja noudetaan.
     *
     */
    function LoadResponsibles(id){
        $.getJSON("php/loadservices.php",{"fetch":"people","id":id}, function(data){
            var $people = $("<div></div>");
            $.each(data,function(idx, resp){
                var responsible = resp.responsible == null ? "" : resp.responsible;
                var $input = $("<input type='text' name='" + resp.responsibility + "' value='"+ responsible + "'></input>");
                $("<div class='flexrow'><div>" + resp.responsibility +  "</div></div>").append($("<div></div>").append($input)).appendTo($people);
            });
            $("#responsible-data").html("<h3>Tekijät</h3>").append($people);
        });
    }

    /**
     * Lataa näkyville listan messun lauluista
     *
     * @param int id sen messun id, jonka tietoja noudetaan.
     *
     */
    function LoadSongs(id){
        $.getJSON("php/loadservices.php",{"fetch":"songs","id":id}, function(data){
            var $songs = $("<div></div>");
            $.each(data,function(idx, songtitle){
                $("<div class='flexrow'><div>" + songtitle +  "</div></div>").appendTo($songs);
            });
            $("#songdata").html("<h3>Laulut</h3>").append($songs);
        });
    }



    return {

        AddServicesToSelect,
    
    
    }


}();
