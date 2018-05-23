var GeneralStructure = GeneralStructure || {};

GeneralStructure.DragAndDrop = function(){

    var currently_dragged_no;

    /**
     *
     * Liittää messuslotteihin raahaamiseen liittyvät toiminnot
     *
     **/
    function Initialize(){
        $(".slot").on("dragstart",GeneralStructure.DragAndDrop.DragStart);
        $(".drop-target")
            .on("dragover",GeneralStructure.DragAndDrop.DragOver)
            .on("dragleave",GeneralStructure.DragAndDrop.DragLeave)
            .on("drop",GeneralStructure.DragAndDrop.Drop)
    }


    /**
     *
     * Määrittelee, mitä tapahtuu, kun käyttäjä alkaa raahata jotakin
     * slottia
     *
     **/
    function DragStart(){
        $(".slot").addClass("drop-hide");
        $(this).removeClass("drop-hide");
        currently_dragged_no = $(this).find(".slot-number").text() * 1;
    }


    /**
     * 
     * Määrittelee, mitä tapahtuu, kun elementti
     * raahataan slottien välisen tilan ylle
     *
     * @param event funktion käynnistänyt tapahtuma
     *
     **/
    function DragOver(event){
        event.preventDefault();  
        event.stopPropagation();
        $(this).addClass("drop-highlight").text("Siirrä tähän");
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
    function DragLeave(event){
        event.preventDefault();  
        event.stopPropagation();
        $(this).text("").removeClass("drop-highlight");
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
            newids.push({"slot_id":id,"newnumber":newno});
            });

        GeneralStructure.SaveSlotOrder(newids);
    }


    return {
        Initialize,
    }

}();
