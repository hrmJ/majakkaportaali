/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/

Portal = Portal || {};

Portal.Service = function(){

    //Kukin välilehti tallennetaan tähän
    var TabObjects = {},
        active_tab = undefined,
        tab_titles = { 
            "Yleistiedot":"Details",
            "Vastuunkantajat":"People",
            "Laulut":"Songs",
            "Messun rakenne":"Structure"
        },
        service_date = {},
        //Ota messun id simppelisti url:sta
        service_id = window.location.href.replace(/.*service_id=(\d+).*/,"$1")*1,
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
     * Varmistaa käyttäjältä sivulta lähtemisen, jos tallentamattomia tietoja
     *
     * @param e tapahtuma
     *
     */
    function ConfirmLeavingWithoutSaving(e){
          // Cancel the event as stated by the standard.
          e.preventDefault();
          // Chrome requires returnValue to be set.
          e.returnValue = '';
    }


    /**
     *
     * 
     *
     */
    function GetControlledByPresentation(){
        return controlling_presentation;
    }

    /**
     *
     * Factory-pattern eri välilehtiä edustavien olioiden luomiseksi
     *
     **/
    function TabFactory(){
        this.tabdata = [];
        this.pending_changes = false;
    }

    /**
     *
     * Lisää tallenna-painikkeet kunkin täbin alareunaan
     *
     **/
    TabFactory.prototype.AddSaveButton = function(){
        var self = this;
        if(!this.$div.find("button.save_tab_data").length){
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
        var $tabheader = $(`.${this.tab_type}_tabheader`),
            pending_changes = false;
        if(JSON.stringify(this.tabdata) !== JSON.stringify(this.GetTabData())){
            //Jos muutoksia, näytä tallenna-painike ja muutosindikaattorit
            this.$div.find(".save_tab_data").show();
            $tabheader.text($tabheader.text().replace(" *","") + " *");
            //Lisää poistumisen varmistus
            window.addEventListener('beforeunload', ConfirmLeavingWithoutSaving);
            this.pending_changes = true;
        }
        else{
            //Ei muutoksia, piilota tallenna-painike ja muutosindikaattorit
            $tabheader.text($tabheader.text().replace(" *",""));
            this.$div.find(".save_tab_data").hide();
            //Poista poistumisen varmistus
            this.pending_changes = false;
            $.each(TabObjects, (idx, thistab) => {
                if(thistab.pending_changes){
                    pending_changes = true;
                }
            });

            if(!pending_changes){
                //jos ei muutoksia, poista varoitus
                window.removeEventListener('beforeunload', ConfirmLeavingWithoutSaving);
            }
        }
    };

    /**
     *
     * Suorittaa tietojen tallentamisen jälkeiset toimenpiteet, minimissään ilmoittaa tallennuksesta
     *
     * @param response ajax-vastaus
     *
     **/
    TabFactory.prototype.AfterSavedChanges = function(response){
        this.MonitorChanges();
        var msg = new Utilities.Message("Muutokset tallennettu", $("section.comments:eq(0)")),
            pres_position = {};
        if(controlling_presentation){
            controlling_presentation.Update();
        }
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
        tab.initialized_by_event = false;
        TabObjects[constr] = tab;
        return tab;
    };



    /**
     *
     * Palauttaa tämänhetkisen messun id:n
     *
     */
    function GetServiceId(){
        if(!service_id){
            console.log("NO service id! Might be bad, you know...");
        }
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
     * Asettaa aktiivisen välilehden klikkauksen pohjalta
     *
     * @param e tapahtuma
     * @param ui jquery ui -elementti
     *
     */
    function SetActiveTabByEvent(e, ui){
        var title =  $(ui.newTab[0]).text();
        active_tab = TabObjects[tab_titles[title]];
        active_tab.Initialize();
        active_tab.initialized_by_event = true;
    }



    /**
     *
     * Asettaa aktiivisen välilehden täbin järjestysnumeron pohjalta
     *
     * @param idx välilehden järjrestysnumero, alkaen 0:sta
     *
     */
    function SetActiveTabByIndex(idx){
        var id =  $("#tabs > div:eq(" + idx + ")").attr("id");
        active_tab = TabObjects[id];
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
        $.when(
            Portal.Servicelist.SetSeasonByCustomDate(service_date.dbformat)).done(() => {
                list.LoadServices((d)=>{
                    $sel
                        .append(d.map((s) => `<option value='${s.id}'>${s.servicedate}</option>`))
                        .appendTo($("#service_select_cont").html(""));
                    $sel.selectmenu();
                    $sel.on("selectmenuchange", function(){
                        //Vaihtaa messua pudotusvalikon kautta
                        SetServiceId($(this).val());
                        active_tab.Initialize();
                        Comments.LoadComments();
                        Comments.CreateThemeSelect();
                        SetDate();
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
            raw_date = undefined,
            service_id = GetServiceId();
        return $.getJSON(path, {
            "action" : "get_service_date",
            "id" : service_id
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
        var tab_name_raw, tab_name, tab_idx = 1;
        //huom, käytä oletuksena vastuunkantajat-välilehtieä
        console.log("Initializing the service view...");
        $("#tabs").tabs({ activate: SetActiveTabByEvent});
        $("#tabs > div").each(function(){
            TabFactory.make($(this));
        });
        //tarkista, onko välilehti asetettu urlissa
        tab_name_raw = window.location.href.replace(/.*tab=([a-öA-ö]+).*/,"$1");

        $.each(tab_titles, (title,id) => {
            if(tab_name_raw == id){
                tab_idx =  $("#" + id).index() -1;
                return 0;
            }
        });

        $("#tabs").tabs("option", "active", tab_idx);

        $("#prepared_for_insertion").hide();
        SetActiveTabByIndex(tab_idx);
        if(!active_tab.initialized_by_event){
            console.log(active_tab);
            active_tab.Initialize();
        }

        Comments.LoadComments();
        Comments.CreateThemeSelect();
        //Hae messun päivämäärä ja muodosta messujen vaihtamiseen lista
        $.when(SetDate()).done(() => AddServiceList());
        console.log("Heyyyyy...");
    }


    return {
        Initialize,
        GetServiceId,
        TabFactory,
        SetServiceId,
        GetCurrentTab,
        SetControlledByPresentation,
        GetControlledByPresentation,
        ConfirmLeavingWithoutSaving
    };

}();
