
/**
 *
 * Sisäänkirjautumisskriptien käynnistämiseen backend-puolelta käynnistettävät 
 * ei-salaiset frontend-koodit
 *
 *
 */

Portal = Portal || {};

Portal.LoginForm = function(){

    var ajaxpath = Utilities.GetAjaxPath("Saver.php"),
        iframe_callback = undefined;


    /**
     *
     * Lähettää pyynnön serverille varsinaisen kirjautumislogiikan
     * käynnistämiseksi
     *
     */
    function TestCredentials(){
        $.post(ajaxpath, {
            "action" : "login",
            "username": $("[name='username']").val(),
            "password": $("[name='password']").val(),
        }, (result)=>{
            if(result.trim() == "success"){
                if(iframe_callback){
                    iframe_callback();
                }
                else{
                    ShowLoginOptions();
                }
            }
        
        });
    }

    /**
     *
     * Näyttää pikalinkit sisältöön, jos kirjauduttu onnistuneesti
     *
     * (huom: ei haittaa, vaikka tämä on front end -koodia, koska ilman onnistuneesti
     * asetettua php:n sessiomuuttujaa sisältöön ei pääse käsiksi vaikka linkit olisikin)
     *
     */
    function ShowLoginOptions(){
        $(".login-details").hide();
        $("#navigation_options").fadeIn();
    }

    /**
     *
     * Jos kutsuttu iframesta, tallenna sulkemisfunktio
     *
     */
    function SetIframeCallback(callback){
        iframe_callback = callback;
        console.log(callback);
    }

    /**
     *
     * Lisää valintaelementin, jolla voi suoraan siirtyä yhden roolin vastuihin
     *
     */
    function AddRoleSelect(){
        var path = Utilities.GetAjaxPath("Loader.php");
        $.getJSON(path, { "action" : "get_list_of_responsibilities" },
            (d) => {
                $("#login_resp_sel").append((d.map((resp) => `<option>${resp}</option>`)));
                $("#login_resp_sel").selectmenu();
                $("#login_resp_sel").on("selectmenuchange", function(){
                    window.location="main.php?role="+$(this).val();
                });
            }
        );
    }


    /**
     *
     *
     * Jos yritetty saapua suoraan esimerkiksi messukohtaiselle sivulle,
     * printtaa järkevä kirjautumislomake (mikäli tarpeen)
     *
     */
    function TestIsLogged(){
        var login_status = $("[name='login_ready']").val(),
            $iframe = undefined;
        if(login_status == "Ei kirjauduttu"){
            //Utilities.BlurContent();
            $("main, nav, byline, .container").hide();
            $iframe = $(`<iframe src='index.php' class='login_iframe'> </iframe>`).prependTo("body");
            $iframe.on("load", function() {
               this.contentWindow.Portal.LoginForm.SetIframeCallback(CloseIframe)
            });
        }
        else{
            if($("body").hasClass("loginpage")){
                ShowLoginOptions();
            }
        }
    }

    /**
     *
     * Jos iframesta kutsuttu kirjautumisikkuna palauttanut hyväksytyn, lataa uudelleen
     *
     */
    function CloseIframe(){
        window.location = window.location;
    }

    /**
     *
     * Etsi lähin messu tulevaisuudesta ja siirry siihen
     *
     * @param ev klikkaustapahtuma
     *
     */
    function GetNextService(ev){
        var path = Utilities.GetAjaxPath("Loader.php"),
            msg = undefined;
            $launcher = $(ev.target);
        $.getJSON(path, {
            "action": "get_next_service",
        }, (service_id)=> {
                console.log(service_id);
                if(service_id == "no next services"){
                    msg = new Utilities.Message("Ei uusia messuja. Siirrytään pääsivulle.", 
                        $(".nav_options"))
                    msg.Show(8888);
                    setTimeout(()=>window.location="main.php", 2800);
                }
                else{
                    window.location = "service.php?service_id=" + service_id + "&tab=" + $launcher.attr("id");
                }
            });
    }


    /**
     *
     * Alustaa kirjautumistoiminnallisuuden
     *
     */
    function Initialize (){
        console.log("Alustetaan kirjautumislomake");
        $(".loginbutton").click(TestCredentials);
        TestIsLogged();
        $("#main").click(() => window.location="main.php");
        $(".nextservicelink").click(GetNextService);
        if($("body").hasClass("loginpage")){
            AddRoleSelect();
        }
    }



    return {

        Initialize,
        SetIframeCallback
    
    }

}()
