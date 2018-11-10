/**
 *
 * Moduuli, jolla hallitaan messujen rakennetta: lauluja, raamatunkohtia, 
 * messukohtaisia tai yleisempiä infodioja jne.
 *
 **/
var GeneralStructure = function(){

    var adder,
        slot_types = [ "infoslide", "songslide", "bibleslide", "liturgicalslide"],
        sortable_slot_list = undefined,
        service_id = 0,
        controlling_presentation = undefined;

    /**
     *
     * Merkitse, että näkymä ladattu diaesityksen hallintapaneelin kautta
     *
     * @param pres Presentation-olio, joka avannut messun muokkausikkunan
     *
     */
    function SetControlledByPresentation(pres){
        controlling_presentation = pres;
    }

    /**
     *
     * Tekee rakenteesta messukohtaisen asettamalla messun id:n parametriksi
     *
     * @param id messun id
     *
     **/
    function SetServiceid(id){
        service_id = id;
    }


    /**
     *
     * Lataa informaation messun rakenneosista
     *
     * @param data ajax-responssina tullut informaatio sloteista
     *
     **/
    function ReloadSlots(data){
        if(controlling_presentation){
            //Päivitä diaesitys, jos muokattu sitä kautta
            controlling_presentation.Update();
        }
        $(".structural-slots").load("php/ajax/Loader.php",
            {
                "action":"load_slots",
                "service_id": service_id
            }, InitializeSlotFunctionality);
    }

    /**
     *
     * Poista jokin messun rakenneosa kokonaan
     *
     **/
    function RemoveSlot(){
        var path = Utilities.GetAjaxPath("Saver.php");
        $.post(path, {
            "action":"remove_slot",
            "id":$(this).parents(".slot").find(".slot_id").val(),
            "service_id": service_id
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
        console.log(service_id);
        $.post("php/ajax/Saver.php",{
            "action":"update_slot_order",
            "newids":newids,
            "service_id": service_id
            },
            ReloadSlots);
    }


    /**
     *
     * Alustaa uusia slotteja lisäävän jquery-ui-menun toiminnallisuuden
     *
     * @param selector minne menu liitetään
     *
     */
    function InitializeNewslotMenu(selector){
        $(selector).html("");
         var $header = $("<h4 class='closed'>Syötä uusi messuelementti</h4>")
            .click(Portal.Menus.InitializeFoldMenu);
         var $menu = $(`
          <div class="hidden">
              <ul class="action_li newslide_links">
                  <li id="songslide_launcher">Laulu</li>
                  <li id="bibleslide_launcher">Raamatunkohta</li>
                  <li id="liturgicalslide_launcher">Liturginen teksti</li>
                  <li id="infoslide_launcher">Muu</li>
              </ul>
          </div>`);
        $header.appendTo(selector);
        $menu.appendTo(selector);
        $menu.find("li").click(function(){
                var slot_type = $(this).attr("id").replace(/([^_]+)_launcher/,"$1");
                if(slot_types.indexOf(slot_type)>-1){
                    GeneralStructure.SlotFactory.SlotFactory.make(slot_type, service_id)
                        .LoadParams(true)
                        .ShowWindow();
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
                .make(slot_type, service_id, $container)
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
     * Lisää kaikille segmenttityypeille yhteisiä tietoja
     *
     *
     */
    function AddCommonFields(){
        var $h2 = $(`<h2 class="subwindow-opener slide-section-controller">Ohjeet diannäyttäjälle</h2>`),
            $sec =  $(`
                <section class="slidemodel-flex-column controller-subwindow">
                    <textarea class='instruction' placeholder="Tietoja esim. siitä, kannattaako dian jälkeen näyttää blank screen"></textarea>
                </section>
            `).hide();
        $h2.click(Portal.Menus.InitializeFoldMenu);
        $(".slidemodel").append([$h2, $sec]);
    }

    /**
     *
     * Alusta kaikki messun rakenneosiin liittyvät tapahtumat
     *
     * @param menuselector minne slottien lisäysmenu liitetään
     *
     **/
    function Initialize(menuselector){
        AddCommonFields();
        InitializeNewslotMenu(menuselector);
        InitializeSlotFunctionality();
    }


    return {
         Initialize,
         ReloadSlots,
         SaveSlotOrder,
         SetServiceid,
         SetControlledByPresentation
    }
    



}();



