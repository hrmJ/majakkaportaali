$(document).ready(function(){

    if($("body").hasClass("slides")){

        var list = new Portal.Servicelist.List();
        Utilities.SetAjaxPath("../php/ajax");
        Utilities.SetImgPath("../assets/images");
    
        Slides.Controls.Initialize();

        //Ladataan messujen lista
        $.when(
            Portal.Servicelist.SetSeasonByCurrentDate()
        ).done(() => {
            list.LoadServices(
                Slides.ContentLoader.AddServicesToSelect.bind(Slides.ContentLoader)
            );
        });
        
        if (!Portal.Menus.GetInitialized()){
            Portal.Menus.InitializeMenus();
        }
    
    }


});
