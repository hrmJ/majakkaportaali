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
					var serviceIdMatch = document.location.search.match(/service_id=(\d+)/);
					if(serviceIdMatch.length > 1){
						var serviceId = serviceIdMatch[1];
						Slides.Presentation.Initialize(serviceId)
					}
        });
        
        if (!Portal.Menus.GetInitialized()){
            Portal.Menus.InitializeMenus();
        }
    
    }


});
