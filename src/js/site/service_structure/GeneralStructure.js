/**
 *
 * Moduuli, jolla hallitaan messujen rakennetta: lauluja, raamatunkohtia, 
 * messukohtaisia tai yleisempiä infodioja jne.
 *
 **/
var GeneralStructure = function(){

    var adder;
    var slot_types = [ "infoslide", "songslide"];

    /**
     *
     * Lataa informaation messun rakenneosista
     *
     * @param data ajax-responssina tullut informaatio sloteista
     *
     **/
    function ReloadSlots(data){
        $(".structural-slots").load("php/ajax/Structure.php",
            {"action":"load_slots"},
            function(){
                InitializeSlotFunctionality();
                GeneralStructure.DragAndDrop.Initialize();
            }
        );
    }

    /**
     *
     * Poista jokin messun rakenneosa kokonaan
     *
     **/
    function RemoveSlot(){
        $.post("php/ajax/Structure.php", {
            "action":"remove_slide",
            "id":$(this).parents(".slot").find(".slot_id").val()
            }, 
            ReloadSlots
        );
    }

    /**
     *
     * Tallentaa muutokset slottien järjestykseen
     *
     * $param newids slottien järjestysnumerot siirron jälkeen
     *
     **/
    function SaveSlotOrder(newids){
        //Save the changes
        $.post("php/ajax/Saver.php",{
            "action":"update_slot_order",
            "newids":newids },
            ReloadSlots);
    }


    /**
     *
     * Alustaa uusia slotteja lisäävän jquery-ui-menun toiminnallisuuden
     *
     **/
    function InitializeNewslotMenu(){
        $(".menu").menu({ 
            position: { my: "bottom", at: "right-5 top+5" },
            select: function(e, u){
                var slot_type = u.item.find(">div:eq(0)").attr("id").replace(/([^_]+)_launcher/,"$1");
                if(slot_types.indexOf(slot_type)>-1){
                    GeneralStructure.SlotFactory.SlotFactory.make(slot_type)
                        .LoadParams()
                        .ShowWindow();
                }
                }
            });
    }

    /**
     *
     * Lisää toiminnallisuuden messuslotteihin
     *
     **/
    function InitializeSlotFunctionality(){
        $(".slot:last-of-type").after("<div class='drop-target'></div>");
        $(".remove-link").click(RemoveSlot);
        $(".edit-link").click(function(){
            //Jos käyttäjä haluaa muokata slottia, pyydä olio slottitehtaalta:
            var $container = $(this).parents(".slot");
            var slot_type = $container.find(".slot_type").val();
            //hack:
            if(slot_type.match("segment")){
                slot_type = slot_type.replace("segment","slide");
            }
            GeneralStructure.SlotFactory.SlotFactory
                .make(slot_type, $container)
                .LoadParams()
                .ShowWindow();
        });
    }

    /**
     *
     * Alusta kaikki messun rakenneosiin liittyvät tapahtumat
     *
     **/
    function Initialize(){
        InitializeNewslotMenu();
        InitializeSlotFunctionality();
        GeneralStructure.DragAndDrop.Initialize();
        //Vain testaamista varten: lisäillään vähän id:itä
        //$(".menu").find("li").each(function(){if($(this).text()=="Laulu")$(this).attr({"id":"addsongmenu"});});
    }


    return {
         Initialize,
         ReloadSlots,
         SaveSlotOrder
    }
    



}();
