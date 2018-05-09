/**
 * Tapahtumat, jotka liittyvät messurakenteen määrittelyyn
 */

var GeneralStructure = GeneralStructure || {};

/**
 *
 * Alempi namespace: messun rakenteen muokkaamiseen liittyvät tapahtumat
 *
 **/
GeneralStructure.Events = function(){

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
    }

    /**
     *
     * Pohjusta messuslottien siirtoon liittyvät tapahtumat
     *
     **/
    function InitializeDragAndDrop(){
    
    
    }


    


    return {
    
    
    
    }


}();






/**
 *
 * Valitse, mitä sisältöä ryhdytään lisäämään. 
 * Valintamenun  (jqueryui menu) callback.
 *
 */
GeneralStructure.SelectTheContentToAdd = function(e, u){
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

/**
 *
 * Pohjusta messun rakenteen muokkaus ja siihen liittyvät tapahtumat
 * 
 **/
GeneralStructure.Initialize = function(){
        $(".menu").menu({ position: { my: "bottom", at: "right-5 top+5" }, select: SelectTheContentToAdd});
        GeneralStructure.UpdateAdderEvents();
        //Vain testaamista varten: lisäillään vähän id:itä
        $(".menu").find("li").each(function(){if($(this).text()=="Laulu")$(this).attr({"id":"addsongmenu"});});
}


