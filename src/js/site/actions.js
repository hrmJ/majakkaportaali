// Lisää toiminnallisuuden sivulle: lataa sisällön,
// liittää eventit... Eri tavalla riippuen siitä, mikä osasivu ladattuna.


$(function(){
    //Navigation etc:
    Menus.InitializeMenus();
    //Other actions:
    if ($("body").hasClass("servicedetails")){
        //Messukohtainen näkymä
        $("#tabs").tabs();
        Service.Initialize();
    }
    else if ($("body").hasClass("servicelist")){
        //Kaikkien messujen lista
        Servicelist.Initialize();
        //Ehkä filtteröitynä?
    }
    else if ($("body").hasClass("service_structure")){
        //Kaikkien messujen lista
        GeneralStructure.Initialize();
        //Ehkä filtteröitynä?
    }

});
