var GeneralStructure = GeneralStructure || {};

GeneralStructure.DragAndDrop = function(){

    var currently_dragged_no;

    /**
     *
     * Liittää messuslotteihin raahaamiseen liittyvät toiminnot
     *
     **/
    function Initialize(){
        $(".slot").draggable( {
                revert: true,
                start: DragStart,
                stop: CleanUp
            });
        $(".drop-target").droppable({
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
     *
     **/
    function Drop(event){
        event.preventDefault();  
        event.stopPropagation();
        var prevno = $(this).prev().find(".slot-number").text();
        if(prevno=="") prevno = 0;
        var newids = [];
        console.log("PREVNO: " + prevno);
        $(".slot").each(function(){
            var thisno = $(this).find(".slot-number").text()*1;
            var id = $(this).find(".slot_id").val()*1;
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
            console.log({"slot_id":id,"newnumber":newno});
            newids.push({"slot_id":id,"newnumber":newno});
            });

        GeneralStructure.SaveSlotOrder(newids);
    }


    return {
        Initialize,
    }

}();
