/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/

Portal = Portal || {};

Portal.Service = function(){

    //Kukin välilehti tallennetaan tähän
    TabObjects = {};
    active_tab = undefined;
    tab_titles = { 
        "Yleistiedot":"Details",
        "Vastuunkantajat":"People",
        "Laulut":"Songs",
        "Messun rakenne":"Structure"
    };
    service_date = {};
    //Ota messun id simppelisti url:sta
    service_id = window.location.href.replace(/.*service_id=(\d+).*/,"$1")*1;
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
    }

    /**
     *
     * Lisää tallenna-painikkeet kunkin täbin alareunaan
     *
     **/
    TabFactory.prototype.AddSaveButton = function(){
        console.log("ADDING SB!");
        var self = this;
        if(!this.$div.find("button.save_tab_data").length){
            console.log(this);
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
        var $tabheader = $(`.${this.tab_type}_tabheader`);
        if(JSON.stringify(this.tabdata) !== JSON.stringify(this.GetTabData())){
            //Jos muutoksia, näytä tallenna-painike ja muutosindikaattorit
            this.$div.find(".save_tab_data").show();
            $tabheader.text($tabheader.text().replace(" *","") + " *");
            console.log(this.GetTabData());
        }
        else{
            //Ei muutoksia, piilota tallenna-painike ja muutosindikaattorit
            $tabheader.text($tabheader.text().replace(" *",""));
            this.$div.find(".save_tab_data").hide();
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
        var msg = new Utilities.Message("Muutokset tallennettu", this.$div),
            pres_position = {};
        if(controlling_presentation){
            //Päivitetään esityksen tiedot muutosten jälkeen
            //TODO: vapaavalintaiseksi?
            pres_position = {
                sec_idx : controlling_presentation.$section.index(),
                slide_idx: controlling_presentation.$slide.index()
            };
            $.when(controlling_presentation.SetContent()).done(()=>{
                var new_msg = new Utilities.Message("Diaesitys päivitetty", this.$div),
                    $sec = undefined,
                    $slide = undefined;
                if(controlling_presentation.d.find("section").length >= pres_position.sec_idx){
                    $sec = controlling_presentation.d.find("section:eq(" + pres_position.sec_idx + ")");
                    if($sec.find("arcticle").length >= pres_position.slide_idx){
                        $slide = $sec.find("article:eq(" + pres_position.slide_idx + ")");
                        if($slide.length){
                            controlling_presentation.Activate($slide);
                        }
                        else{
                            controlling_presentation.Activate($sec.find("article:eq(0)"));
                        }
                    }
                }
                new_msg.Show(2000);
                console.log(pres_position);
                //controlling_presentation.Activate(pres_position);
            });
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
    }



    /**
     *
     * Asettaa aktiivisen välilehden täbin järjestysnumeron pohjalta
     *
     * @param idx välilehden järjrestysnumero, alkaen 0:sta
     *
     */
    function SetActiveTabByIndex(idx){
        console.log("id is " + idx);
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
        console.log("HEYHOO");
        console.log(service_id);
        return $.getJSON(path, {
            "action" : "get_service_date",
            "id" : service_id
            }, 
            (d) => {
                console.log("date is: "  + d);
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
        var tab_name_raw, tab_name;
        console.log("Initializing the service view...");
        $("#tabs").tabs({ activate: SetActiveTabByEvent});
        $("#tabs > div").each(function(){
            TabFactory.make($(this));
        });
        //tarkista, onko välilehti asetettu urlissa
        tab_name_raw = window.location.href.replace(/.*tab=([a-öA-ö]+).*/,"$1");
        tab_idx = 0;
        $.each(tab_titles, (title,id) => {
            if(tab_name_raw == id){
                tab_idx =  $("#" + id).index() -1;
                $("#tabs").tabs("option", "active", tab_idx);
                return 0;
            }
        });

        $("#prepared_for_insertion").hide();
        SetActiveTabByIndex(tab_idx);
        active_tab.Initialize();

        Comments.LoadComments();
        Comments.CreateThemeSelect();
        //Hae messun päivämäärä ja muodosta messujen vaihtamiseen lista
        $.when(SetDate()).done(() => AddServiceList());

    }


    return {
        Initialize,
        GetServiceId,
        TabFactory,
        SetServiceId,
        GetCurrentTab,
        SetControlledByPresentation,
        GetControlledByPresentation
    };

}();
