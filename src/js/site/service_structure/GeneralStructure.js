/**
 *
 * Moduuli, jolla hallitaan messujen rakennetta: lauluja, raamatunkohtia, 
 * messukohtaisia tai yleisempiä infodioja jne.
 *
 **/
var GeneralStructure = function(){

    var adder;
    var slot_types = [ "infoslide", "songslide", "bibleslide"];
    var sortable_slot_list = undefined;

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
     * @param $ul listan jquery-representaatio
     *
     **/
    function SaveSlotOrder($ul){
        var newids = [];
        $.each($ul.find("li:not(.between-slots)"),function(idx,el){
            var slot_id = $(this).find(".slot_id").val();
            console.log({"slot_id":slot_id,"newnumber":idx+1});
            newids.push({"slot_id":slot_id,"newnumber":idx+1});
        });
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
                        .LoadParams(true)
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

        sortable_slot_list =  sortable_slot_list || 
            new GeneralStructure.DragAndDrop.SortableList(
            $(".structural-slots:eq(0)"),
            {
                draggables: ".slot",
                drop_callback: SaveSlotOrder,
                number: ".slot-number",
                id_class: ".slot_id",
                idkey: "slot_id",
                handle: ".drag_handle",
                numberclass: ".slot-number"
            }
            );
        sortable_slot_list.Initialize();
    }

    /**
     *
     * Alusta kaikki messun rakenneosiin liittyvät tapahtumat
     *
     **/
    function Initialize(){
        InitializeNewslotMenu();
        InitializeSlotFunctionality();
        //BibleModule.AttachAddressPicker($(".bs_test"),"Evankeliumi");
    }


    return {
         Initialize,
         ReloadSlots,
         SaveSlotOrder
    }
    



}();


