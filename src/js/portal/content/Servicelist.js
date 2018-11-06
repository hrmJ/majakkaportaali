/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/

var Portal = Portal || {};


Portal.Servicelist = function(){

    var current_season = {},
        all_seasons = {},
        list_of_services = undefined,
        manageable_lists = {},
        current_data_list,
        infoboxes = {},
        deactivate_role = false,
        askaboutclosing = false;

    /**
     *
     * Sulkee vastuukohtaisen näkymän, mutta kysyy tarvittaessa varmistusta
     *
     */
    function CloseFilterView() {
        var leave = true;
        if(askaboutclosing){
            leave = confirm("Et ole tallentanut muutoksia! Palataanko silti päänäkymään?");
        }
        if(leave){
            askaboutclosing = false;
            list_of_services.LoadServicesClean();
            Portal.Menus.GetSideMenu().Close();
        }
    }

    /**
     *
     * Lataa listan vastuista ja muista suodatettavista yksityiskohdista
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     **/
    function LoadListOfRoles(){
        var path = Utilities.GetAjaxPath("Loader.php"),
            $list = $(".menu-parent:visible .show-options").html(""),
            $header_li = $("<li><span>yleisnäkymä</span></li>")
                .click(list_of_services.LoadServicesClean.bind(list_of_services))
                .appendTo($list),
            cl = 'class="launch-action"',
            promise = $.getJSON(path, 
                {
                    action: "get_list_of_responsibilities"
                }, 
                (resps) =>  $list.append(resps.map((resp) => `<li ${cl}><span>${resp}</span></li>`))
            );

        $.when(promise).done(() => {
            $list.find(".launch-action").click(function(){
                list_of_services.SetFilteredBy($(this).text());
                list_of_services.FilterServices.bind(list_of_services)();
                }
            );
            // Korvaa mobiilissa listan otsikko
            $list.find("li").click(function(){
                if($(".fa-bars").is(":visible")){
                    $(this).parents(".menu-parent")
                        .find(".menu-header")
                        .text($(this).text());
                }
            });
        });
    };


    /**
     *
     * Lista kaikista yhden tietyn kauden messuista
     *
     */
    var List = function(){
    
        this.is_editable = false;
        this.filterby = "";


        /**
         *
         * Merkitsee, että lista on suodatettu jonkin vastuun tms. mukaan
         *
         * @param filterby minkä mukaan on suodatettu
         *
         */
        this.SetFilteredBy = function(filterby){
            this.filteredby = filterby;
            return this;
        }

        /**
         *
         * Lataa messulistan ja varmistaa, että ladataan alkuperäinen, vain messut sisältävä lista
         *
         **/
        this.LoadServicesClean = function(){
            this.is_editable = false;
            $(".covermenu").hide();
            $(".showmainlink_container").hide();
            $(".menu-header").text("Valitse rooli");
            this.LoadServices();
        };

        /**
         *
         * Lataa messulistan
         *
         * @param callback Mahdollisesti suoritettava callback-funktio
         *
         **/
        this.LoadServices = function(callback){
            var path = Utilities.GetAjaxPath("Loader.php");
                callback = callback || this.Output.bind(this),
                self = this;
            return $.getJSON(path,{
                action: "get_list_of_services",
                startdate: current_season.startdate,
                enddate: current_season.enddate,
                }, (data) => {
                    current_data_list = data;
                    callback(data);
                });
        };

        /**
         *
         * Lataa messulistan vain jonkin vastuun osalta
         *
         **/
        this.FilterServices = function(){
            this.is_editable = true;
            var path = Utilities.GetAjaxPath("Loader.php");
            $(".covermenu").hide();
            $(".showmainlink_container").show();
            $.when($.getJSON(path,{
                action: "get_filtered_list_of_services",
                "startdate" : current_season.startdate,
                "enddate" : current_season.enddate,
                filteredby: this.filteredby
                }, this.Output.bind(this))).done(()=>{
                    $(".byline h2").text(this.filteredby);
                    $(".menu-header").text(this.filteredby);
                    $("input.responsible").on("change paste keyup selectmenuchange", () => {
                        //Lisää vahti, joka varmistaa että muutokset tallennettu.
                        window.addEventListener('beforeunload', Portal.Service.ConfirmLeavingWithoutSaving);
                        askaboutclosing = true;
                    });
                } );
        };


        /**
         *
         * Tulostaa listan ja liittää sen osaksi html-DOMia
         *
         * @param data listaan syötettävät tiedot
         *
         **/
        this.Output = function(data){
            var prevmonth = 0,
                self = this;
            $("#servicelist").html("");
            $(".covermenu:not(#managelist)").hide();
            if(!data.length){
                $("#servicelist").append(`
                    <p class='info-p'>
                    Ei messuja tällä messukaudella. Lisää messuja tai valitse
                    toinen kausi Hallitse-valikosta.
                    </p>
                    `
                    );
            }
            $.each(data,function(idx, service){
                var thismonth = service.servicedate.replace(/\d+\.(\d+)\.\d+/g,"$1") * 1 ;
                if (thismonth != prevmonth){
                    prevmonth = thismonth;
                    $("#servicelist").append(`<li class='monthname'>${MonthName(thismonth)}</li>`);
                }
                var $li = $(`<li class='service_link_li' id="service_id_${service.id}">
                    <span>${service.servicedate}</span>
                    </li>`);
                if(!self.is_editable && service.theme){
                    //Ei muokattava, vaan messulinkit sisältävä lista
                    $li.append(`<span>${service.theme}</span>`)
                }
                else{
                    //Muokattava vastuukohtainen lista
                    $li.append(`<span>
                        <input type='text' class='responsible' value='${service.responsible || ''}'></input>
                        <input type='hidden' class='service_id' value='${service.service_id}'></input>
                        </span>`);
                }
                ;
                $("#servicelist").append($li);
            });

            if(!self.is_editable){
                //Lisää siirtyminen messukohtaiseen näkymään:
                $(".service_link_li").click(function(){
                    var id = $(this).attr("id").replace(/.*id_(\d+)/,"$1");
                    window.location =  "service.php?service_id=" + id;
                });
                $("#savebutton").hide();
                $(".byline h2").text("Messut / " + current_season.name);
            }
            else{
                $("#savebutton").show();
            }
        };

        /**
         *
         * Tallentaa vastuisiin tehdyt muutokset
         *
         */
        this.Save = function(){
            var self = this,
                data = [],
                path = Utilities.GetAjaxPath("Saver.php");

            askaboutclosing = false;

            $("#servicelist").find(".service_link_li").each(
                function(){
                    data.push({
                        "service_id": $(this).find(".service_id").val(),
                        "responsibility": self.filteredby,
                        "responsible": $(this).find(".responsible").val()
                    });
                }
                );
            $.post(path,{
                "action":"bulksave_responsibilities",
                "params": data
            }, (debugdata) => {
                var msg = new Utilities.Message("Tiedot tallennettu", $("#savebutton_container"));
                msg.Show(2800);
                console.log(debugdata);
                window.removeEventListener('beforeunload', Portal.Service.ConfirmLeavingWithoutSaving);
            });
        };


        /**
         *
         * Lataa  listan messuista ja näiden viereen valintalaatikot 
         *
         */
        this.PrintSelectableServiceList = function(){
            this.$selectable_list  = $("<ul></ul>");
            return this.LoadServices((services) => {
                this.$selectable_list.append(
                    services.map((s)=> {
                        return `<li>
                            <input type='checkbox' class='service_for_info' value='${s.id}'></input>
                            ${s.servicedate}
                        </li>`;
                    })
                );
            });
        }

    }


    /**
     *
     * Hakee nykyhetkeä lähimmän messukauden
     *
     * @param no_current_date jätetäänkö nykyinen kausi määrittämättä päivämäärän mukaan
     *
     */
    function SetSeasonByCurrentDate(no_current_date){
        if (no_current_date){
            return 0;
        }
        var path = Utilities.GetAjaxPath("Loader.php");
        return $.getJSON(path, {
            "action": "get_current_season",
            "date": $.datepicker.formatDate('yy-mm-dd', new Date())
        }, (season) => current_season = season);
    }


    /**
     *
     * Hakee käyttäjän määrittelemää päivämäärää lähimmän messukauden
     *
     * @param customdate 
     *
     */
    function SetSeasonByCustomDate(customdate){
        var path = Utilities.GetAjaxPath("Loader.php");
        return $.getJSON(path, {
            "action": "get_current_season",
            "date": customdate
        }, (season) => current_season = season);
    }

    /**
     *
     * Lataa valikkopalkin select-elementtiin kaudet ja valitsee nykyistä
     * päivää lähinnä olevan.
     *
     *
     */
    function LoadSeasonSelect(){
        var path = Utilities.GetAjaxPath("Loader.php");
        all_seasons = {};
        return $.getJSON(path, {action: "list_seasons_unformatted" }, function(data){
            //Indeksöidään kaikki kaudet all_seasons-muuttujaan, jottei
            //tarvitse tehdä erillistä ajax-kutsua kautta vaihdettaessa
            $.each(data, function(idx, row){
                all_seasons[row.id] = row;
            });
            //Varmistetaan päivittyminen muutosten jälkeen:
            current_season = all_seasons[current_season.id];
            $("#season-select")
                .html("")
                .append(data.map((season) => 
                    `<option value=${season.id}>${season.name}</option>`).join("\n"))
                .val(current_season.id)
                .selectmenu("refresh")
                .on("selectmenuchange", function() {
                    current_season = all_seasons[$(this).val()];
                    $.when(list_of_services.LoadServices()).done(() => {
                            $.each(infoboxes, (key, obj) => obj.LoadData());
                    });
                    if($("#managelist").is(":visible")){
                        //Päivitä myös mahdollisesti auki oleva hallintavalikko
                        //co
                        Portal.ManageableLists.GetCurrentList().LoadList();
                    }
                    Portal.Menus.GetSideMenu().Close();
                });
        });
    }



    /**
     *
     * Lataa ja tulostaa listan tulevista tapahtumista 
     *
     */
    function LoadEventList(){
        var path = Utilities.GetAjaxPath("Loader.php");
        $("#eventlist").html("");
        $.getJSON(path, {"action":"future_events"}, (evlist)=>{
            $.each(evlist, (idx, e)=>{
                raw_date = $.datepicker.parseDate("yy-mm-dd", e.event_date);
                event_date =  $.datepicker.formatDate('dd.mm', raw_date);
                $(`<li>
                    <strong>${event_date}:</strong>
                    <span>${e.name}</span>
                    <input type='hidden' value='${e.place_and_time + ". " + e.description}'></input>
                </li>`)
                    .click((e)=>{
                        var $target = $(e.target);
                        if ($target.get(0).tagName !== "LI"){
                            $target = $target.parents("li");
                        }
                        var msg = new Utilities.Message($target.find("input").val(), 
                            $target);
                        msg.SetTitle($target.find("span").text());
                        msg.AddCloseButton()
                        msg.Show(99999);
                    })
                    .appendTo("#eventlist");
            });
        });
    }




    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     * @param no_current_date jätetäänkö nykyinen kausi määrittämättä päivämäärän mukaan
     *
     **/
    function Initialize(no_current_date){
        var list_type = '',
            role = '';
        console.log("Initializing the list of services...");
        $.when(SetSeasonByCurrentDate(no_current_date)).done(() => {
            $.when(LoadSeasonSelect().done( () => {
                    $.when(list_of_services.LoadServices()).done(() =>  {
                        LoadListOfRoles()
                            infoboxes.events = new Portal.AdditionalInfoBoxes.EventInfoBox();
                            infoboxes.smallgroups = new Portal.AdditionalInfoBoxes.SmallGroupInfoBox();
                            infoboxes.comments = new Portal.AdditionalInfoBoxes.CommentInfoBox();
                            $.each(infoboxes, (key, obj) => obj.LoadData());
                        if(window.location.href.indexOf("role")>0 && !deactivate_role){
                            //Jos määritetty url:ssa, että suodatetaan vastuun mukaan
                            role = window.location.href.replace(/.*role=([^&]+).*/,"$1");
                            list_of_services.SetFilteredBy(role);
                            list_of_services.FilterServices();
                            $(".menu-header").text(role);
                            //Varmistetaan, ettei lataa filtteröityä listaa
                            //esim. hallintaoperaation jälkeen
                            deactivate_role = true;
                        }
                    });
                }));
        });
        //Alusta myös laululista käyttöä varten
        SongLists.Initialize(true);
        $("#savebutton").click(list_of_services.Save.bind(list_of_services));
        $(".showmainlink_container").hide();
        $("#show_main_link").click(CloseFilterView);
        $("#structure_launcher").click(() => window.location="service_structure.php");
        $("#slideshow_launcher").click(() => window.location="/slides");
        //Vastuukohtainen suodattaminen
        $(".covermenu-target_managelist").each(function(){
            var list = Portal.ManageableLists.ListFactory.make($(this));
            $(this).click(list.LoadList.bind(list));
            manageable_lists[list.list_type] = list;
        });
    }

    /**
     *
     * Muuttaa kuukauden numeron nimeksi
     *
     * @param month_no kuukauden numero
     *
     **/
    function MonthName(month_no){
        var months = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", 
                      "Toukokuu","Kesäkuu","Heinäkuu","Elokuu","Syyskuu",
                      "Lokakuu","Marraskuu","Joulukuu"];
        return months[month_no - 1];
    }

    /**
     *
     * Palauttaa nykyisen messukauden
     *
     **/
    function GetCurrentSeason(){
        return current_season;
    }


    /**
     *
     * Palauttaa nyt aktiivisena olevan listan taulukkona
     *
     **/
    function GetActiveListAsData(){
        return current_data_list;
    }

    //Alustetaan eri osiot
    list_of_services = new List();

    return {
        Initialize,
        List,
        GetCurrentSeason,
        GetActiveListAsData,
        SetSeasonByCurrentDate,
        SetSeasonByCustomDate
    };

}()
