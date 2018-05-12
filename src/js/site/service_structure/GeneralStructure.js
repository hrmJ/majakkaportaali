/**
 *
 * Moduuli, jolla hallitaan messujen rakennetta: lauluja, raamatunkohtia, 
 * messukohtaisia tai yleisempiä infodioja jne.
 *
 **/
var GeneralStructure = function(){

    var adder;
    var currently_dragged_no;

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
            UpdateAdderEvents
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
        $.post("php/ajax/Structure.php",{
        "action":"save",
        "slideclass":"update_numbers",
        "segment_type":"update_numbers",
        "newids":newids
        }, ReloadSlots);
    }


    /**
     *
     * Alusta kaikki messun rakenneosiin liittyvät tapahtumat
     *
     **/
    function Initialize(){
        var self = this;
        $(".menu").menu({ 
            position: { my: "bottom", at: "right-5 top+5" },
            select: function(e, u){
                var slot_type = u.item.find(">div:eq(0)").attr("id").replace(/([^_]+)_launcher/,"$1");
                self.SlotFactory.SlotFactory.make(slot_type)
                    .LoadParams()
                    .ShowWindow();
                }
            });
        $(".slot:last-of-type").after("<div class='drop-target'></div>");
        $(".remove-link").click(RemoveSlot);
        $(".slot").on("dragstart",GeneralStructure.DragAndDrop.DragStart);
        $(".drop-target")
            .on("dragover",GeneralStructure.DragAndDrop.DragOver)
            .on("dragleave",GeneralStructure.DragAndDrop.DragLeave)
            .on("drop",GeneralStructure.DragAndDrop.Drop)
        $(".edit-link").click(function(){
            //Jos käyttäjä haluaa muokata slottia, pyydä olio slottitehtaahlta:
            var $container = $(this).parents(".slot");
            GeneralStructure.SlotFactory.SlotFactory
                .make($container)
                .LoadParams()
                .ShowWindow();
        });
        //Vain testaamista varten: lisäillään vähän id:itä
        //$(".menu").find("li").each(function(){if($(this).text()=="Laulu")$(this).attr({"id":"addsongmenu"});});
    }


    return {
         Initialize,
    }
    



}();
