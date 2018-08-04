/**
 *
 * Yksittäisen messun / palveluksen toiminnot
 *
 **/

var Portal = Portal || {};


Portal.Servicelist = function(){

    season = "?";


    /**
     *
     * Lataa listan vastuista ja muista suodatettavista yksityiskohdista
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     **/
    function LoadShowList(){
        var path = Utilities.GetAjaxPath("Loader.php"),
            $list = $("#show-options").html(""),
            cl = 'class="launch-action"',
            promise = $.getJSON(
                    path,
                    {action: "get_list_of_responsibilities"}, 
                    (resps) =>  $list.append(resps.map((resp) => `<li ${cl}>${resp}</li>`))
                    );
        $.when(promise).done(() => {
            //TODO: tämäkin data tietokannasta
            $list.append("<li ${cl}>teema</li>");
        });
    };


    /**
     *
     * Lista kaikista yhden tietyn kauden messuista
     *
     **/
    var List = function(){
    

        /**
         *
         * Lataa messulistan
         *
         * @param callback funktio, joka ajetaan kun lataus on valmis
         *
         **/
        this.LoadServices = function(callback){
            var path = Utilities.GetAjaxPath("Loader.php");
            $.getJSON(path,{
                action: "get_list_of_services"
                }, callback);
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
                $("#servicelist").append(`
                    <li class='service_link_li' id="service_id_${service.id}">
                    <span>${service.servicedate}</span>
                    <span>${service.theme}</span>
                    </li>
                    `);
            });
            
            //Lisää siirtyminen messukohtaiseen näkymään:
            $(".service_link_li").click(function(){
                var id = $(this).attr("id").replace(/.*id_(\d+)/,"$1");
                window.location = window.location.href = "service.php?service_id=" + id;
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
        List_of_services.LoadServices(List_of_services.Output);
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
    var List_of_services = new List();

    return {
        Initialize,
        List
    };

}()
