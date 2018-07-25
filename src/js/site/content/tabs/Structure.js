/**
 *
 * Messun rakenteen säätely
 *
 **/
Service.TabFactory.Structure = function(){

    /**
     *
     * Syöttää tietokannasta haetun rakennedatan html:ään
     *
     **/
    this.SetStructure = function(html){
        $("#service_specific_structure").html(html);
        GeneralStructure.Initialize();
        GeneralStructure.SetServiceid(Service.GetServiceId());
    };


    /**
     *
     * Hakee messu-spesifin rakenteen (laulut, osiot, yms) tietokannasta
     *
     * @param callaback ajax-vastauksen käsittelevä funktio
     *
     **/
    this.GetStructure = function(callback){
        $.get("php/ajax/Loader.php",{
            action : "get_service_specific_slots",
            service_id: Service.GetServiceId()
        }, callback.bind(this));
    };

    /**
     *
     *
     **/
    this.SaveTabData = function(){
        console.log("structure");
    };

    /**
     *
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        //var data = [];
        //this.$div.find(".editable_data_list li").each(function(){
        //    data.push({
        //        responsibility: $(this).find("div:eq(0)").text(),
        //        responsible: $(this).find("input[type='text']").val()
        //    });
        //});
        //return data;
    }


};
