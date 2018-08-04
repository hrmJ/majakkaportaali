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
                }, this.Output);
        };

        /**
         *
         * Lataa messulistan vain jonkin vastuun osalta
         *
         **/
        this.FilterServices = function(){
            this.is_editable = true;
            var path = Utilities.GetAjaxPath("Loader.php");
            $.getJSON(path,{
                action: "get_filtered_list_of_services",
                filteredby: this.filteredby
                }, this.Output);
        };


        /**
         *
         * Tulostaa listan ja liittää sen osaksi html-DOMia
         *
         * @param data listaan syötettävät tiedot
         *
         **/
        this.Output = function(data){
            $("#servicelist").html("");
            var prevmonth = 0;
            $.each(data,function(idx, service){
                thismonth = service.servicedate.replace(/\d+\.(\d+)\.\d+/g,"$1") * 1 ;
                if (thismonth != prevmonth){
                    prevmonth = thismonth;
                    $("#servicelist").append(`<li>${MonthName(thismonth)}</li>`);
                }
                var $li = $(`<li class='service_link_li' id="service_id_${service.id}">
                    <span>${service.servicedate}</span>
                    </li>`);
                if(!this.is_editable && service.theme){
                    $li.append(`<span>${service.theme}</span>`)
                }
                else{
                    console.log(service);
                    $li.append(`<span>${service.responsible || ''}</span>`)
                }
                ;
                $("#servicelist").append($li);
            });

            if(!this.is_editable){
                //Lisää siirtyminen messukohtaiseen näkymään:
                $(".service_link_li").click(function(){
                    var id = $(this).attr("id").replace(/.*id_(\d+)/,"$1");
                    window.location = window.location.href = "service.php?service_id=" + id;
                });
            }
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
