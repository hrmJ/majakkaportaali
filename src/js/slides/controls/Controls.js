var Slides = Slides || {};

/**
 *
 * Diaesityksen hallinta, ohjaus ja elementit
 *
 */
Slides.Controls = function(){



    /**
     *
     * Lisää toiminnot oikean puolen (tyylien) hallintaelementteihin
     *
     */
    function AddRightControlsFunctionality(){
        //Päivitä select-elementtien tyyli jquery-ui:n mukaiseksi
        $("#service-select").selectmenu();
        //Sellaiset tyylisäätimet, joissa on vaihtoehtona joko säädeltävä arvo tai automaattinen arvo
        $(".control-toggler").parent().next("div").hide();
        $(".control-toggler").click(function(){
            $(this).parent().next("div").slideToggle();
            $(this).parent().next("div").find("section").toggleClass("controller-not-in-use");
            if(!$(this).parent().next("div").find("section").hasClass("controller-not-in-usel")){
                UpdateControllers(pres);
            }
        });

        //Muuta fonttimuokkausten kohdetta, kun tätä säätelevää pudotusvalikkoa käytetään
        $("#layout-target_select").on("selectmenuchange",function(){UpdateControllers(pres)});

        //TODO: anna spectrum-funktion argumenttina palette-niminen taulukoiden taulukko, jossa on käytössä olevat värit
        //align-items:center;
    }


    /**
     *
     * Lisää toiminnot vasemman puolen hallintaelementteihin
     *
     */
    function AddLeftControlsFunctionality(){
            $(".contentadder-heading").click(function(){ 
                //Avaa haluttu sisällönlisäysikkuna 
                pres.controls[$(this).parent().attr("class").split(" ")[1]].OpenWidget($(this)); 
            });

            //Lisää widgettien lisäyslinkit kaikkiin vasemman valikon widgetteihin kerralla
            $(".side-menu-left .contentadder-open")
                .append(`<div class='addtoprescontrols'>
                    <a class='addtopreslink' href='javascript:void(0)'>Lisää esitykseen</a> 
                    <a class='shownowlink' href='javascript:void(0)'> Näytä nyt</a> </div>`);
            //Huolehdi siitä, että navigointipalkin linkkien klikkaus aktivoi oikeanpuolimmaisen menun
            $(".addtopreslink").click(function(){
                //avaa haluttu sisällönlisäysikkuna 
                pres.controls[$(this).parents(".contentadder").attr("class").split(" ")[1]].AddToPres(); 
            });
            $(".contentadder-open").hide();
            //Piilota menut ja linkit joita ei vielä käytetä
            $("#controllink, #addcontentlink, #layoutlink").parent().hide();
            //Jos esitys käynnissä, luo mahdollisuus vaihtaa esityksen hallinnan ja sisällön lisäyksen välillä
            $("#controllink").click(function(){ 
                $(".preloader, .contentlist").toggle(); 
                if($(this).text()=="Valitse sisältö")
                    $(this).text("Hallitse esitystä");
                else
                    $(this).text("Valitse sisältö");
            });

    }

    /**
     *
     * Avaa vasemman taai oikean päämenun
     *
     */
    function OpenMenu(){
        if($(this).parents("ul").hasClass("leftmenu")){
            $(".side-menu-left").toggle();
        }
        else {
            $(".side-menu-right").toggle();
        }
        $(this).parent().toggleClass("active-menutab");
    }

    /**
     *
     * Alustaa hallintaelementit käyttöön
     *
     *
     */
    function Initialize(){
        console.log("Initializing controls");
        AddLeftControlsFunctionality();
        AddRightControlsFunctionality();
        $(".side-menu-left, .side-menu-right").hide();
        $(".addlink").click(OpenMenu);


        //pres = new Presentation();
        //$("#launchlink").click(function(){ pres.open(); });


    
    }




    return {
    

        Initialize,
    
    }



}()
