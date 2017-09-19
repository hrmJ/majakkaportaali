/**
 * Tapahtumat, jotka liittyvät messurakenteen määrittelyyn
 */

var adder = undefined;

/**
 * Lisää kaikkiin messun segmentteihin muokkaus- ja poisto-ominaisuudet
 */
function UpdateAdderEvents(){
    $(".edit-link").click(function(){
        switch($(this).parents(".slot").find(".slot_type").val()){
            default:
                console.log($(this).parents(".slot").find(".slot_type").val());
                adder = new InfoSlideAdder($(this).parents(".slot"));
                break;
        }
        adder.LoadParams($(this).parents(".slot").find(".content_id").val());
        adder.ShowWindow();
    });
    $(".remove-link").click(function(){console.log("ssssssremove") });
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
