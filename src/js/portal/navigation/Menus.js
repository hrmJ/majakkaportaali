var Portal = Portal || {};

/**
 *
 * Moduuli erilaisille menuille
 *
 **/
Portal.Menus = function(){

    menus = {};
    initialized = false;

    var Hamburgermenu = function(){

        this.Initialize = function(){
        
            $(".hamburger").click(function(){$(this).next(".dropdown").slideToggle();});

        }
    
    
    }


    /**
     *
     * Yksinkertainen, koko ruudun peittävä menu
     *
     * @param name menun nimi. Tämän on oltava html:ssä elementin id sekä
     * lisäksi menun avaavan elementin css-luokkana muodossa covermenu-target_nimi
     *
     */
    var Covermenu = function(name){


        this.name = name;
        this.$menu = $("#" + name);
        this.$launcher = $(".covermenu-target_" + this.name);


        /**
         *
         * Alustaa menun toiminnallisuuden
         *
         */
        this.Initialize = function(){
            var $close = $(`<div class='closer_div' id='close_covermenu'>
                   <a href='javascript:void(0);'><i class='fa fa-arrow-left'></i> Takaisin</a>
                </div>`)
                .click(this.CloseMenu.bind(this))
                .prependTo(this.$menu);
            if(this.$launcher.length){
                this.$launcher.click(this.OpenMenu.bind(this));
            }
        }

    
        /**
         *
         * Avaa oikean menun, kun klikattu oikeaa linkkiä
         *
         * @param $launcher menu-klikkauksen laukaissut linkki
         *
         **/
        this.OpenMenu = function($launcher){
            //Varmista ensin, että kaikki muut covermenut ovat peitettyinä,
            //koska näitä voi olla kerrallaan näkyvissä vain yksi.
            $(".covermenu").hide();
            this.$menu.show();
            //Utilities.BlurContent();
        }

        /**
         *
         * Sulkee oikean menun, kun klikattu oikeaa linkkiä
         *
         *
         **/
        this.CloseMenu = function(){
            this.$menu.hide();
            //$(".blurcover").remove();
        }
        
    }

    /**
     *
     * Avaa pudotusmenun
     *
     *
     **/
    function OpenDropDown(){
        var $child = $(this).find(".menu-child");
        $child.css({"top": $(this).height() + "px"});
        if($(this).hasClass("active-menu")){
            $child.slideUp(() => $(this).removeClass("active-menu"));
        }
        else{
            $(this).addClass("active-menu");
            $child.slideDown();
        }
    }

    /**
     *
     * Luo uuden taittomenun
     *
     *
     */
    function InitializeFoldMenu(){
        //Avaa tai sulje tarkemmat fonttien muokkaussäätimet ym
        $(this).next().slideToggle(); 
        $(this).toggleClass("opened");
    }


    function InitializeMenus(){
    
        console.log("initializing menus");
        //Aseta taittovalikot toimintakuntoon
        $(".controller-subwindow").hide()
        $(".subwindow-opener").click(InitializeFoldMenu);
        $(".covermenu").each(function(){
            var name = $(this).attr("id");
            menus[name] = new Covermenu(name);
            menus[name].Initialize();
        });

        $(".menu-child").hide();
        $(".menu-parent").click(OpenDropDown);
            //.each((idx, el) => $(el).css({"width":$(el).find(".menu-child").width() + "px"}));
        $("#season-select").selectmenu();

        initialized = true;
        $(".covermenu").appendTo("main");
    
    }

    function GetInitialized(){
        return initialized;
    }


    return {
        InitializeMenus,
        InitializeFoldMenu,
        GetInitialized,
        menus
    }



}();
