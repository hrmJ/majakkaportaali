// Lisää toiminnallisuuden sivulle: lataa sisällön,
// liittää eventit... Eri tavalla riippuen siitä, mikä osasivu ladattuna.


$(function(){
    Portal.LoginForm.Initialize();
    //Navigation etc:
    if (!Portal.Menus.GetInitialized()){
        Portal.Menus.InitializeMenus();
    }
    //Other actions:
    if ($("body").hasClass("servicedetails")){
        Portal.Service.Initialize();
    }
    else if ($("body").hasClass("servicelist")){
        //Kaikkien messujen lista
        Portal.Servicelist.Initialize();
        //Ehkä filtteröitynä?
    }
    else if ($("body").hasClass("service_structure")){
        //Kaikkien messujen lista
        GeneralStructure.Initialize(".structural-element-add");
        //Ehkä filtteröitynä?
    }
    else if ($("body").hasClass("loginpage")){
        //$("main").width($(window).width());
    }

    if($("#logout_launcher").length){
        //Uloskirjautuminen
        $("#logout_launcher").click( () => {
            var path = Utilities.GetAjaxPath("Saver.php");
            $.post(path, { action: "logout" }, () => {
                window.location = "index.php";
            });
        });
    }
});
