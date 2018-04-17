/**
 * Tapahtumat, jotka liittyvät messurakenteen määrittelyyn
 */

var adder = undefined;
var currently_dragged_no = undefined;

/**
 * Lisää kaikkiin messun segmentteihin muokkaus- ja poisto-ominaisuudet.
 * Lisäksi mahdollistaa segmenttien uudelleenjärjestelyn raahaamalla.
 */
function UpdateAdderEvents(){
    $(".slot:last-of-type").after("<div class='drop-target'></div>");
    $(".edit-link").click(function(){
        var $container = $(this).parents(".slot");
        var slot_type  = $container.find(".slot_type").val();
        switch(slot_type){
            case "infosegment":
                adder = new InfoSlideAdder($container);
                break;
            case "songsegment":
                adder = new SongSlideAdder($container);
                break;
            case "biblesegment":
                adder = new BibleSlideAdder($container);
                break;
        }
        adder.LoadParams();
        adder.ShowWindow();
    });

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

}

/**
 *
 * Valitse, mitä sisältöä ryhdytään lisäämään. 
 * Valintamenun  (jqueryui menu) callback.
 *
 */
function SelectTheContentToAdd(e, u){
    if(u.item.find("span").length==0){
        switch(u.item.text()){
            //case "Yksittäinen dia":
            //    break;
            case "Laulu":
                adder = new SongSlideAdder(u.item.parents(".structural-element-add"));
                break;
            case "Raamatunkohta":
                adder = new BibleSlideAdder(u.item.parents(".structural-element-add"));
                break;
            default:
                adder = new InfoSlideAdder(u.item.parents(".structural-element-add"));
                break;
        }
        if (adder != undefined) adder.ShowWindow();
    }
}


$(document).ready(function(){
    if($("body").hasClass("service_structure")){
        $(".menu").menu({ position: { my: "bottom", at: "right-5 top+5" }, select: SelectTheContentToAdd});
        UpdateAdderEvents();


        //Vain testaamista varten: lisäillään vähän id:itä
        $(".menu").find("li").each(function(){if($(this).text()=="Laulu")$(this).attr({"id":"addsongmenu"});});

    }
    }
);
