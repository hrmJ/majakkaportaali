$(document).ready(function(){

    if($("body").hasClass("slides")){

        var list = new Portal.Servicelist.List();
        Utilities.SetAjaxPath("../php/ajax");
    
        Slides.Controls.Initialize();
        list.LoadServices(Slides.ContentLoader.AddServicesToSelect);
        if (!Portal.Menus.GetInitialized()){
            Portal.Menus.InitializeMenus();
        }
    
    }


});
