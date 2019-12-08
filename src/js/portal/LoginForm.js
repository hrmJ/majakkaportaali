
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
            if(result.search(/success/) > -1 ){
                if(iframe_callback){
                    iframe_callback();
                }
                else{
                    $.when(AddRoleSelect()).done(() => ShowLoginOptions());
                }
            }
            else {
                let msg = new Utilities.Message(
                    "Väärä käyttäjänimi tai salasana.",
                    $(".logincontent"));
                msg.$box.css({"top": 300 + "px", "left": 30 + "px"});
                msg.Show(4000);
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
        return $.getJSON(path, { "action" : "get_list_of_responsibilities" },
            (d) => {
                console.log("MOO");
                console.log(d);
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
            $iframe = undefined,
            path = Utilities.GetAjaxPath("Loader.php");
        if(login_status == "Ei kirjauduttu"){
            //Utilities.BlurContent();
            $("main, nav, byline, .container").hide();
            $iframe = $(`<iframe src='index.php' class='login_iframe'> </iframe>`).prependTo("body");
            $iframe.on("load", function() {
               this.contentWindow.Portal.LoginForm.SetIframeCallback(CloseIframe)
            });
        }
        if($("body").hasClass("loginpage")){
            $.getJSON(path, {"action" : "test_is_logged"}, (user) => {
                if(user !== "Ei kirjauduttu"){
                    $.when(AddRoleSelect()).done(() => ShowLoginOptions());
                }
            });
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
            msg = undefined,
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
     * Näytetään pikavalikko, jossa voi lisätä infodian ja piilotetaan näytöltä muut elementit
     *
     * @param ev klikkaustapahtuma
     *
     */
    function ShowInfoSlideAdder(ev){
        var list = new Portal.Servicelist.List(),
            tagname =  $(ev.target).get(0).tagName;
        if(["TEXTAREA", "INPUT"].indexOf(tagname) > -1){
            ev.stopPropagation();
            return 0;
        }
        if(!$("#add_info section").is(":visible")){
            $(".nav_options li:not(#add_info), .li_label").hide();
            $.when(Portal.Servicelist.SetSeasonByCurrentDate()).done(() => {
                $.when(list.PrintSelectableServiceList()).done(() => {
                    $("#add_info .selected_services")
                        .html("")
                        .append(list.$selectable_list);
                });
            });
            $("#add_info section").fadeIn();
            $("#add_info").addClass("nohover").removeClass("limit_width");
        }
        //$(".logincontent").height($(window).height()*2);
    }

    /**
     *
     * Piilottaa infodian lisäävän pikavalikon 
     *
     */
    function HideInfoSlideAdder(){
        $(".nav_options li:not(#add_info), .li_label").show();
        $("#add_info").removeClass("nohover").addClass("limit_width");
        $("#add_info section").fadeOut()
    
    }

    /**
     *
     * Tallentaa pikavalikon kautta syötetyn infodian
     *
     */
    function SaveInfoSlide(){
        var service_ids = [],
            params = undefined,
            path = Utilities.GetAjaxPath("Saver.php"),
            msg = new Utilities.Message("", $(".logincontent"));
        $("#add_info [type='checkbox']").each(function(){
            if($(this).is(":checked")){
                service_ids.push($(this).val());
            }
        });
        if(!service_ids.length){
            alert("Valitse ainakin yksi messu, jossa infoa näytetään!")
            return 0;
        }
        params = {
            action: "save_added_Infos",
            params: {
                segment: {
                    header: $("#add_info .header").val(),
                    maintext: $("#add_info .maintext").val()
                },
                content_id: "",
                service_ids: service_ids
            }
        };
        $.post(path, params, (d) => {
            console.log(d);
            HideInfoSlideAdder();
            msg
                .Add("Voit muokata ja tarkentaa infoa pääsivun Hallitse-valikosta.")
                .SetTitle("Kiitos! Info tallennettu onnistuneesti.")
                .Show(5000);
        });
        console.log(params);
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
        $("#add_info").click(ShowInfoSlideAdder);
        $("#save_info_add").click(SaveInfoSlide);
        $("#cancel_info_add").click(HideInfoSlideAdder);
        $("#add_info h4").click(Portal.Menus.InitializeFoldMenu);
    }



    return {

        Initialize,
        SetIframeCallback
    
    }

}()
