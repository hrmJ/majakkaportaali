/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/

Portal = Portal || {};

Portal.Service = function(){

    //Kukin välilehti tallennetaan tähän
    TabObjects = {};

    //Ota messun id simppelisti url:sta
    service_id = window.location.href.replace(/.*service_id=(\d+).*/,"$1")*1;
    service_date = {};
    is_refreshed = false;

    /**
     *
     * Factory-pattern eri välilehtiä edustavien olioiden luomiseksi
     *
     **/
    function TabFactory(){
        this.tabdata = [];
    }

    /**
     *
     * Lisää tallenna-painikkeet kunkin täbin alareunaan
     *
     **/
    TabFactory.prototype.AddSaveButton = function(){
        var self = this;
        if(!$("button.save_tab_data").length){
            var $but = $("<button class='save_tab_data'>Tallenna</button>")
                .click(this.SaveTabData.bind(this))
                .hide();
                this.$div.append($but);
        }
    };

    /**
     *
     * Tallentaa välilehdessä tehdyt muutokset 
     *
     **/
    TabFactory.prototype.SaveTabData = function(){
        var self = this,
            protoself = (this.AfterSavedChanges ? this : this.__proto__);
        this.tabdata = this.GetTabData();
        $.post("php/ajax/Saver.php",{
            action: self.action,
            service_id: Portal.Service.GetServiceId(),
            data: self.tabdata
            }, protoself.AfterSavedChanges.bind(protoself));
    };

    /**
     *
     * Tarkastelee muutoksia ja ilmoittaa käyttäjälle, jos tallentamattomia
     * muutoksia havaitaan
     *
     **/
    TabFactory.prototype.MonitorChanges = function(){
        console.log("Monitoring... " + this.tab_type);
        var $tabheader = $(`.${this.tab_type}_tabheader`);
        if(JSON.stringify(this.tabdata) !== JSON.stringify(this.GetTabData()) && !is_refreshed){
            //Jos muutoksia, näytä tallenna-painike ja muutosindikaattorit
            console.log("found changes!")
            this.$div.find(".save_tab_data").show();
            $tabheader.text($tabheader.text().replace(" *","") + " *");
        }
        else{
            //Ei muutoksia, piilota tallenna-painike ja muutosindikaattorit
            $tabheader.text($tabheader.text().replace(" *",""));
            this.$div.find(".save_tab_data").hide();
        }
    };

    /**
     *
     * Lisää tallenna-painikkeet kunkin täbin alareunaan
     *
     * @param response ajax-vastaus
     *
     **/
    TabFactory.prototype.AfterSavedChanges = function(response){
        console.log("вот здесь: ");
        console.log(response);
        this.MonitorChanges();
        var msg = new Utilities.Message("Muutokset tallennettu", this.$div);
        msg.Show(2000);
    };



    /**
     *
     * Tuottaa yhden välilehtiolion haluttua tyyppiä
     *
     * @param $tab jquery-esitys yhdestä välilehti-divistä
     *
     **/
    TabFactory.make = function($div){
        var constr = $div.attr("id");
        var tab;
        TabFactory[constr].prototype = new TabFactory();
        tab = new TabFactory[constr]();
        tab.tab_type = constr;
        tab.$div = $div;
        TabObjects[constr] = tab;
        return tab;
    };



    /**
     *
     * Palauttaa tämänhetkisen messun id:n
     *
     */
    function GetServiceId(){
        return service_id;
    }


    /**
     *
     * Palauttaa aktiivisen välilehden määritellystä tyypistä
     *
     * @param tabtype välilehden tyyppi
     *
     */
    function GetCurrentTab(tabtype){
        return TabObjects[tabtype];
    }

    /**
     *
     * asettaa tämänhetkisen messun id:n
     *
     * @param id uusi id
     *
     **/
    function SetServiceId(id){
        service_id = id;
    }

    /**
     *
     * Lisää valintaelementin, jolla voi vaihtaa nykyistä messua
     *
     */
    function AddServiceList(){
        var list = new Portal.Servicelist.List(),
            $sel = $("<select><option>Valitse messu</option></select>");
        console.log(service_date.dbformat);
        $.when(
            Portal.Servicelist.SetSeasonByCustomDate(service_date.dbformat)).done(() => {
                list.LoadServices((d)=>{
                    $sel
                        .append(d.map((s) => `<option value='${s.id}'>${s.servicedate}</option>`))
                        .appendTo($("#service_select_cont").html(""));
                    $sel.selectmenu();
                    $sel.on("selectmenuchange", function(){
                        SetServiceId($(this).val());
                        Initialize();
                    });
                    $sel.val(GetServiceId());
                    $sel.selectmenu("refresh");
                });
            });
    }

    /**
     *
     * Asettaa nykyisen messun päivämäärän
     *
     *
     */
    function SetDate(){
        var path = Utilities.GetAjaxPath("Loader.php"),
            raw_dat = undefined;
        return $.getJSON(path, {
            "action" : "get_service_date",
            "id" : GetServiceId()
            }, 
            (d) => {
                raw_date = $.datepicker.parseDate("yy-mm-dd", d);
                service_date = {
                    dbformat: d,
                    hrformat: $.datepicker.formatDate('dd.mm.yy', raw_date)
                };
                $(".byline h2").text("Majakkamessu " + service_date.hrformat);
            });
    }

    /**
     *
     * Palauttaa messun päivämäärän
     *
     */
    function GetDate(){
        return service_date;
    }

    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     **/
    function Initialize(){
        console.log("Initializing the service view...");

        $("#tabs > div").each(function(){
            TabFactory.make($(this));
        })
        TabObjects.Details.GetTheme(TabObjects.Details.SetTheme);
        TabObjects.Details.GetOfferingTargets(
            TabObjects.Details.SetOfferingTarget.bind(TabObjects.Details));
        TabObjects.Details.GetBibleSegments(TabObjects.Details.SetBibleSegments);
        TabObjects.People.GetResponsibles(TabObjects.People.SetResponsibles);
        TabObjects.Structure.GetStructure(TabObjects.Structure.SetStructure);
        for(this_tab in TabObjects){
            TabObjects[this_tab].AddSaveButton();
        }

        Comments.LoadComments();
        Comments.CreateThemeSelect();
        Portal.SongSlots.LoadSongsToSlots(TabObjects.Songs);
        SongLists.Initialize();
        $("#prepared_for_insertion").hide()
            .draggable({
                revert: true,
                refreshPositions: true,
                cursor: "move",
                opacity:0.89,
                zIndex:100,
                start: function(e){
                     $(e.target).find(".attach_instructions").hide();
                     $(e.target).find("h4").addClass("attaching_title");
                },
                stop: function(e){
                     $(e.target).find(".attach_instructions").show();
                     $(e.target).find("h4").removeClass("attaching_title");
                },
                classes: {
                    "ui-draggable-dragging": "insert_box_dragging"
                },
                handle: ".fa-arrows",
                //snap:".songinput",
            });
        //Hae messun päivämäärä ja muodosta messujen vaihtamiseen lista
        $.when(SetDate()).done(() => AddServiceList());

    }


    return {
        Initialize,
        GetServiceId,
        TabFactory,
        SetServiceId,
        GetCurrentTab
    };

}();
