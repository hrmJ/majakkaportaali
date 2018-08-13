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
        manageable_lists = {};


    /**
     *
     * Lataa listan vastuista ja muista suodatettavista yksityiskohdista
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     **/
    function LoadShowList(){
        var path = Utilities.GetAjaxPath("Loader.php"),
            $list = $("#show-options").html("<li>yleisnäkymä</li>"),
            cl = 'class="launch-action"',
            promise = $.getJSON(
                    path,
                    {action: "get_list_of_responsibilities"}, 
                    (resps) =>  $list.append(resps.map((resp) => `<li ${cl}>${resp}</li>`))
                    );
        $.when(promise).done(() => {
            //TODO: tämäkin data tietokannasta
            //$list.append("<li ${cl}>teema</li>");
            $list.find(".launch-action").click(function(){
                 list_of_services.SetFilteredBy($(this).text());
                 list_of_services.FilterServices.bind(list_of_services)();
                }
            );
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
         * Lataa messulistan
         *
         **/
        this.LoadServices = function(){
            var path = Utilities.GetAjaxPath("Loader.php");
            return $.getJSON(path,{
                action: "get_list_of_services",
                startdate: current_season.startdate,
                enddate: current_season.enddate,
                }, this.Output.bind(this));
        };

        /**
         *
         * Lataa messulistan vain jonkin vastuun osalta
         *
         **/
        this.FilterServices = function(){
            this.is_editable = true;
            var path = Utilities.GetAjaxPath("Loader.php");
            $.when($.getJSON(path,{
                action: "get_filtered_list_of_services",
                "startdate" : current_season.startdate,
                "enddate" : current_season.enddate,
                filteredby: this.filteredby
                }, this.Output.bind(this))).done(()=>{
                    $(".byline h2").text(this.filteredby);
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
            $.each(data,function(idx, service){
                thismonth = service.servicedate.replace(/\d+\.(\d+)\.\d+/g,"$1") * 1 ;
                if (thismonth != prevmonth){
                    prevmonth = thismonth;
                    $("#servicelist").append(`<li>${MonthName(thismonth)}</li>`);
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
                    window.location = window.location.href = "service.php?service_id=" + id;
                });
                $("#savebutton").hide();
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
            });
        };
    }


    /**
     *
     * Hakee nykyhetkeä lähimmän messukauden
     *
     *
     */
    function SetSeasonByCurrentDate(){
        var path = Utilities.GetAjaxPath("Loader.php");
        return $.getJSON(path, {
            "action": "get_current_season",
            "date": $.datepicker.formatDate('yy-mm-dd', new Date())
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
            console.log(all_seasons);
            $("#season-select")
                .append(data.map((season) => 
                    `<option value=${season.id}>${season.name}</option>`).join("\n"))
                .val(current_season.id)
                .selectmenu("refresh")
                .on("selectmenuchange", function() {
                    current_season = all_seasons[$(this).val()];
                    list_of_services.LoadServices();
                });
        });
    }


    /**
     *
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     **/
    function Initialize(){
        var list_type = '';
        console.log("Initializing the list of services...");
        $.when(SetSeasonByCurrentDate()).done(() => {
            $.when(list_of_services.LoadServices()).done(() => {
                LoadShowList();
                LoadSeasonSelect();
                }
            );
        });
        $("#savebutton").click(list_of_services.Save.bind(list_of_services));
        $("#structure_launcher").click(() => window.location="service_structure.php");
        $(".covermenu-target_managelist").each(function(){
            var list = Portal.ManageableLists.ListFactory.make($(this));
            $(this).click(list.LoadList.bind(list));
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


    //Alustetaan eri osiot
    list_of_services = new List();

    return {
        Initialize,
        List,
        GetCurrentSeason
    };

}()
