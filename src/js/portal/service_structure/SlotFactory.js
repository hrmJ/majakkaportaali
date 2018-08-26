
var GeneralStructure = GeneralStructure || {};

/**
 *
 * Factory-pattern eri rakennetyyppejä edustavien olioiden luomiseksi
 *
 */
GeneralStructure.SlotFactory = function(){


    /**
     *
     * Factory-pattern eri rakennetyyppejä edustavien olioiden luomiseksi
     *
     */
    function SlotFactory(){
        this.tabdata = [];
    }

    /**
     *
     * Tuottaa yhden rakenneolion haluttua tyyppiä
     *
     * @param slot_type luotavan slotin tyyppi 
     * @param service_id mahdollinen messun id, jos messukohtainen rakenne
     * @param $container mihin liitetään
     *
     **/
    SlotFactory.make = function(slot_type, service_id, $container){
        var constr = slot_type;
        var slot;
        console.log("making : " + service_id);
        SlotFactory[constr].prototype = new SlotFactory();
        slot = new SlotFactory[constr]();
        slot.slot_type = constr;
        slot.$lightbox = $("<div class='my-lightbox structural-element-adder'></div>");
        slot.$preview_window = $(`<div class='preview-window'>
                                  <iframe scrolling='no' frameBorder='0'></iframe>
                                  <button>Sulje esikatselu</button></div>`);
        slot.$container = $container || $(".structural-element-add");
        var $content_id = slot.$container.find(".content_id");
        var $slot_id = slot.$container.find(".slot_id");
        var $header_id = slot.$container.find(".header_id");
        slot.slide_id = ($content_id ? $content_id.val() : 0);
        slot.service_id = service_id;
        slot.id = ($slot_id ? $slot_id.val() : 0);
        slot.header_id = ($header_id ? $header_id.val() : 0);
        slot.previewparams = {segment_type: slot.segment_type};
        slot.previewhtml = "";
        slot.injectables = {"responsibilities":"vastuu tms.", "service_meta": "pvm tms."};
        GeneralStructure.DataLoading.Attach(this);
        GeneralStructure.InjectableData.Attach(this);
        GeneralStructure.Headers.Attach(this);
        GeneralStructure.Images.Attach(this);
        GeneralStructure.LightBox.Attach(this);
        GeneralStructure.Preview.Attach(this);
        slot.SetLightBox();
        slot.Initialize();
        return slot;
    };

    SlotFactory.prototype = {

    }

    /**
     *
     * Oletuksena initialize-funktio, vaikkei keikissa tyypeissä käytettäisikään
     *
     */
    SlotFactory.prototype.Initialize = function(){
    };


    SlotFactory.infoslide = GeneralStructure.SlotFactory.infoslide;
    SlotFactory.songslide = GeneralStructure.SlotFactory.songslide;
    SlotFactory.bibleslide = GeneralStructure.SlotFactory.bibleslide;


    return {
    
        SlotFactory,
    
    }


}();

