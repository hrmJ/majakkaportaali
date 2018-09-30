/**
 *
 * Messun vastuunkantajat. (Vastuunkantajat-välilehti)
 *
 **/
Portal.Service.TabFactory.People = function(){

    this.action = "save_responsibles";

    /**
     *
     * Avaa välilehden ja lataa / päivittää sisällön
     *
     */
    this.Initialize = function(){
        console.log("Initializing the people tab");
        this.GetResponsibles(this.SetResponsibles);
        this.AddSaveButton();
    };


    /**
     *
     * Tulostaa kaikkien messussa mukana olevien vastuunkantajien nimet
     *
     * @param list_of_people ajax-responssina saatu taulukko muodossa [{responsible:x,responsibility:x},{:},...]
     *
     **/
    this.SetResponsibles = function(list_of_people){
        $("#People ul").remove();
        var $ul = $("<ul class='editable_data_list'></ul>");
        $.each(list_of_people, function(idx, person){
            var $li = 
            $ul.append(`<li>
                        <div>${person.responsibility}</div>
                        <div>
                            <input type="text" value="${person.responsible || ''}" </input>
                        </div>
                </li>`);
        });
        $ul.find("input[type='text']").on("change paste keyup",this.MonitorChanges.bind(this));
        $ul.appendTo("#People .embed-data");
        //Tallennetaan data, jotta voidaan tarkastella sen muutoksia
        this.tabdata = this.GetTabData();
    };


    /**
     *
     * Hakee messun vastuunkantajat
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     *
     **/
    this.GetResponsibles = function(callback){
        var path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path,{
            action: "get_responsibles",
            service_id: Portal.Service.GetServiceId()
            }, callback.bind(this));
    };

    /**
     *
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        var data = [];
        this.$div.find(".editable_data_list li").each(function(){
            data.push({
                responsibility: $(this).find("div:eq(0)").text(),
                responsible: $(this).find("input[type='text']").val()
            });
        });
        return data;
    }




};
