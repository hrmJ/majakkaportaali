/**
 * Messun tiedot -välilehti. Yksittäisen messun aihe, raamatunkohdat
 * ja muu yleisen tason (ei ihmisiä koskeva )info, tämän muokkaus ym.
 *
 **/
Service.TabFactory.Details = function(){

    this.action = "save_details";


    /**
     *
     * Hakee messun teeman
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     *
     **/
    this.GetTheme = function(callback){
        $("#service_theme").on("change paste keyup",this.MonitorChanges.bind(this));
        $.get("php/ajax/Loader.php",{
            action: "get_service_theme",
            service_id: service_id
            }, callback.bind(this));
    };

    /**
     *
     * Vaihtaa messun teeman 
     *
     * @param theme uusi teema, joka messulle asetetaan
     *
     **/
    this.SetTheme = function(theme){
        $("#service_theme").val(theme);
        this.tabdata = this.GetTabData();
        $("#service_theme").on("change paste keyup",this.MonitorChanges.bind(this));
        //Tarkkaile muutoksia:
        
    };


    /**
     *
     * Hakee messuun liittyvät raamatunkohdat
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     *
     **/
    this.GetBibleSegments = function(callback){
        console.log("getting bible segments...");
        $.getJSON("php/ajax/Loader.php",{
            action: "get_service_verses",
            service_id: service_id
            }, callback.bind(this));
    };


    /**
     *
     * Hakee käikki tämän kontin sisältämät laulut
     *
     **/
    this.FetchSlots = function(){
        console.log("fetching.." + this.name);
        $.getJSON("php/ajax/Loader.php",{
            action: "load_slots_to_container",
            service_id: Service.GetServiceId(),
            cont_name: this.name
        }, this.SetSlots.bind(this));
    }

    /**
     *
     * Tallentaa messuun liittyvien raamatunkohtien sisällön
     *
     * @param segments messuun liittyvät raamatunkohdat
     *
     **/
    this.SetBibleSegments = function(segments){
        var $segment_list = $("#biblesegments_in_service").html("");
        $.each(segments,function(idx, segment){
            var $li = $("<li></li>").appendTo($segment_list);
            BibleModule.AttachAddressPicker($li, segment.slot_name);
        });
    };


    /**
     *
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        var data = [
                {"type":"theme","value":$("#service_theme").val()}
            ];
        return data;
    };



};


