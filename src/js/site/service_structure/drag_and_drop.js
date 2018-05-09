
/**
 *
 *
 **/

var GeneralStructure = GeneralStructure || {};
var GeneralStructure.Events = GeneralStructure.Events || {};

GeneralStructure.Events.DragAndDrop = function(){


    /**
     *
     **/
    function RemoveSlot(){
    
    }

    /**
     *
     **/
    function ReloadSlots(){
    
    }


    /**
     *
     **/
    function DraggedOver(){
    
    }

    /**
     *
     **/
    function DragLeft(){
    
    }

    /**
     *
     **/
    function Dropped(){
    
    }
        //slottien poisto
        $(".remove-link").click(function(){
            $.post("php/ajax/Structure.php",
                {"action":"remove_slide","id":$(this).parents(".slot").find(".slot_id").val()}, 
                function(data){ 
                    console.log(data);
                    $(".structural-slots").load("php/ajax/Structure.php",{"action":"load_slots"},UpdateAdderEvents);
                });
        });

        //slottien siirtely
        $(".slot").on("dragstart",function(){ 
            $(".slot").addClass("drop-hide");
            $(this).removeClass("drop-hide");
            currently_dragged_no = $(this).find(".slot-number").text() * 1;
        });
        $(".drop-target")
            .on("dragover",function(event){
                event.preventDefault();  
                event.stopPropagation();
                $(this).addClass("drop-highlight").text("Siirrä tähän");
            })
            .on("dragleave",function(event){
                event.preventDefault();  
                event.stopPropagation();
                $(this).text("").removeClass("drop-highlight");
            })
            .on("drop",function(event){
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
                //Save the changes
                $.post("php/ajax/Structure.php",{
                "action":"save",
                "slideclass":"update_numbers",
                "segment_type":"update_numbers",
                "newids":newids
                }, 
                function(data){ 
                    console.log("moro");
                    $("body").prepend(data);
                    $(".structural-slots").load("php/ajax/Structure.php",{"action":"load_slots"}, UpdateAdderEvents);
                }
                );
            });





    return {
        Initialize,
    }

}();
