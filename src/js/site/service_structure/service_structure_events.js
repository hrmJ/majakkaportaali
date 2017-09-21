/**
 * Tapahtumat, jotka liittyvät messurakenteen määrittelyyn
 */

var adder = undefined;
var currently_dragged_no = undefined;

/**
 * Lisää kaikkiin messun segmentteihin muokkaus- ja poisto-ominaisuudet
 */
function UpdateAdderEvents(){
    $(".edit-link").click(function(){
        switch($(this).parents(".slot").find(".slot_type").val()){
            default:
                adder = new InfoSlideAdder($(this).parents(".slot"));
                break;
        }
        adder.LoadParams($(this).parents(".slot").find(".content_id").val());
        adder.ShowWindow();
    });
    $(".remove-link").click(function(){console.log("ssssssremove") });
    //slottien siirtely
    $(".slot").on("dragstart",function(){ 
        $(".slot").addClass("drop-hide");
        $(this).removeClass("drop-hide");
        currently_dragged_no = $(this).find(".slot-number").text();
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
            $(".slot").each(function(){
                var thisno = $(this).find(".slot-number").text();
                if(thisno>prevno & thisno < currently_dragged_no){
                    console.log(thisno *1 + 1);
                }
                else if(thisno>prevno & thisno > currently_dragged_no){
                    console.log(thisno *1);
                }
                else if(thisno == currently_dragged_no){
                    console.log("WILL BE: " + (prevno *1 + 1));
                }
            })
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
            default:
                adder = new InfoSlideAdder(u.item.parents(".structural-element-add"));
                break;
        }
        adder.ShowWindow();
    }
}


$(document).ready(function(){
    if($("body").hasClass("service_structure")){

        $(".menu").menu({ position: { my: "bottom", at: "right-5 top+5" }, select: SelectTheContentToAdd});
        UpdateAdderEvents();

    }
    }
);
