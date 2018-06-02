var GeneralStructure = GeneralStructure || {};

GeneralStructure.DragAndDrop = function(){

    var currently_dragged_no;
    var dd_params;


    /**
     *
     * Liittää messuslotteihin raahaamiseen liittyvät toiminnot
     *
     * @param parameters mudossa 
     *
     * {
     *    draggables: ".css_class",
     *    droppables: ".css_class",
     *    drop_callback: function_reference,
     * }
     *
     **/
    function Initialize(parameters){

        dd_params = parameters;

        var options = {
                revert: true,
                start: DragStart,
                stop: CleanUp
        };
        if(dd_params.draghandle){
            options.handle = dd_params.handle;
        }
        $(dd_params.draggables).draggable(options);

        $(dd_params.droppables).droppable({
                drop: Drop,
                over: DragOver,
                classes: {
                  "ui-droppable-active": "songslot_waiting",
                  "ui-droppable-hover": "songslot_taking",
                },
                out: DragLeave
            });
    }


    /**
     *
     * Määrittelee, mitä tapahtuu, kun käyttäjä alkaa raahata jotakin
     * slottia
     *
     **/
    function DragStart(){
        currently_dragged_no = $(this).find(".slot-number").text() * 1;
    }

    /**
     *
     * Poista raahauksen aikana lisätyt luokat, tekstit ym.
     *
     **/
    function CleanUp(){
        $(".drop-highlight").text("").removeClass("drop-highlight");
        //songslot_waiting
    }


    /**
     *
     * Määrittelee, mitä tapahtuu, kun raahattu
     * elementti poistuu slottien välisen alueen
     * päältä
     *
     * @param event funktion käynnistänyt tapahtuma
     *
     **/
    function DragLeave(){
        $(this).text("").removeClass("drop-highlight");
    }


    /**
     * 
     * Määrittelee, mitä tapahtuu, kun elementti
     * raahataan slottien välisen tilan ylle
     *
     * @param event funktion käynnistänyt tapahtuma
     *
     **/
    function DragOver(){
        $(this).addClass("drop-highlight").text("Siirrä tähän");
    }


    /**
     *
     *
     * Määrittelee, mitä tapahtuu, kun käyttäjä on tiputtanut raahaamansa elementin kohteeseen.
     *
     * @param event funktion käynnistänyt tapahtuma
     * @param callback funktio, joka ajetaan kun uudet numerot laskettu
     *
     **/
    function Drop(event, callback){
        event.preventDefault();  
        event.stopPropagation();
        var prevno = $(this).prev().find(dd_params.number).text();
        if(prevno=="") prevno = 0;
        var newids = [];
        console.log("PREVNO: " + prevno);
        $(dd_params.draggables).each(function(){
            var thisno = $(this).find(dd_params.number).text()*1;
            var id = $(this).find(dd_params.id_class).val()*1;
            var newno = thisno*1;
            if(thisno == currently_dragged_no){
                newno = prevno*1 + 1;
                if(prevno > currently_dragged_no)
                    newno -= 1;
            }
            else if(thisno>currently_dragged_no && thisno > prevno) newno = thisno;
            else if(thisno>currently_dragged_no && thisno <= prevno) newno = thisno -1;
            else if(thisno>prevno && thisno != currently_dragged_no) newno = thisno*1 +1;
            else if(thisno==prevno && thisno >currently_dragged_no) newno = thisno*1 -1;
            else if(thisno==prevno) newno = thisno;
            idkey = dd_params.idkey;
            var keypair = {"newnumber" : newno};
            keypair[dd_params.idkey] = id;
            console.log({idkey:id, "newnumber":newno});
            newids.push(keypair);
            });

        dd_params.drop_callback(newids);
        //GeneralStructure.SaveSlotOrder(newids);
    }


    return {
        Initialize,
    }

}();
