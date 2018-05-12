
var GeneralStructure = GeneralStructure || {};

GeneralStructure.SlotFactory = function(){


    /**
     *
     * Factory-pattern eri välilehtiä edustavien olioiden luomiseksi
     *
     **/
    function SlotFactory(){
        this.tabdata = [];
    }

    /**
     *
     * Tuottaa yhden välilehtiolion haluttua tyyppiä
     *
     * @param slot_type luotavan slotin tyyppi 
     *
     **/
    SlotFactory.make = function(slot_type, $container){
        var constr = slot_type;
        var slot;
        SlotFactory[constr].prototype = new SlotFactory();
        slot = new SlotFactory[constr]();
        slot.slot_type = constr;
        slot.$lightbox = $("<div class='my-lightbox structural-element-adder'></div>");
        slot.$preview_window = $(`<div class='preview-window'>
                                  <iframe scrolling='no' frameBorder='0'></iframe>
                                  <button>Sulje esikatselu</button></div>`);
        // kun luodaan uutta, liitä lightbox sivun yläreunan diviin
        slot.$container = $container || $(".structural-element-add");
        var $content_id = slot.$container.find(".content_id");
        var $header_id = slot.$container.find(".header_id");
        slot.id = ($content_id ? $content_id.val() : 0);
        slot.header_id = ($header_id ? $header_id.val() : 0);
        slot.previewparams = {segment_type: slot.segment_type};
        slot.previewhtml = "";
        slot.injectables = {"responsibilities":"vastuu tms.", "service_meta": "pvm tms."};
        GeneralStructure.DataLoading.Attach(this);
        GeneralStructure.InjectableData.Attach(this);
        GeneralStructure.Headers.Attach(this);
        GeneralStructure.LightBox.Attach(this);
        slot.SetLightBox();
        return slot;
    };

    SlotFactory.prototype = {


    }


    SlotFactory.infoslide = GeneralStructure.SlotFactory.infoslide;
    SlotFactory.songslide = GeneralStructure.SlotFactory.songslide;
    SlotFactory.bibleslide = GeneralStructure.SlotFactory.bibleslide;


    return {
    
        SlotFactory,
    
    }


}();

