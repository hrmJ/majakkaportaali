/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/

var Portal = Portal || {};


Portal.Servicelist = function(){

    var season = "?",
        list_of_services = undefined;


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
     **/
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
            $.getJSON(path,{
                action: "get_list_of_services"
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
     * Alusta messunäkymän sisältö, tapahtumat ym.
     *
     **/
    function Initialize(){
        console.log("Initializing the list of services...");
        list_of_services.LoadServices();
        LoadShowList();
        $("#savebutton").click(list_of_services.Save.bind(list_of_services));
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

    //Alustetaan eri osiot
    list_of_services = new List();

    return {
        Initialize,
        List
    };

}()
