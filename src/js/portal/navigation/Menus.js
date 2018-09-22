var Portal = Portal || {};

/**
 *
 * Moduuli erilaisille menuille
 *
 **/
Portal.Menus = function(){

    var menus = {}
        sidemenu = undefined,
        initialized = false;

    /**
     *
     * Yksinkertainen sivumenu mobiiliin
     *
     * @param $launcher menun avaaja
     *
     */
    var SideMenu = function($launcher){
    
        this.$launcher = $launcher;

        /**
         *
         * Alustaa toiminnallisuuden
         *
         */
        this.Initialize = function(){
            this.$launcher.click(this.Toggle.bind(this));
        }

        /**
         *
         * Avaa tai sulkee menun riippuen siitä, oliko se äsken auki
         *
         */
        this.Toggle = function(){
                this.$launcher.find("i")
                    .toggleClass("fa-bars")
                    .toggleClass("fa-times");
                $(".dropdown").slideToggle()
        }

        /**
         *
         * Avaa menun (vaikka väkisin)
         *
         */
        this.Open = function(){
            if(this.$launcher.is(":visible")){
                this.$launcher.find("i")
                    .removeClass("fa-bars")
                    .addClass("fa-times");
                $(".dropdown").slideDown()
            }
        }

        /**
         *
         * sulkee menun
         *
         */
        this.Close = function(){
            if(this.$launcher.is(":visible")){
                this.$launcher.find("i")
                    .removeClass("fa-times")
                    .addClass("fa-bars");
                $(".dropdown").slideUp()
            }
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
            if(sidemenu)
                sidemenu.Close();
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
        var $child = $(this).find(".menu-child, .menu-child-upper");
        $child.css({"top": $(this).height() - 5 + "px"});
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
     * @ev tapahtuma; pyritään siihen, että vain avaustapahtuma mahdollinen
     * foldmenun klikkauskohteelle
     *
     */
    function InitializeFoldMenu(ev){
        ev.stopPropagation();
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


        //Sivumenu: näitä voi olla vain yksi
        sidemenu = new SideMenu($(".sidemenu-launcher"));
        sidemenu.Initialize();
    }

    function GetInitialized(){
        return initialized;
    }

    function GetSideMenu(){
        return sidemenu;
    }


    /**
     *
     * Lisää valintaikkunan tms. sulkevan painikkeen
     *
     */
    function AddCloseButton($parent_el){
        var $a = $("<a class='boxclose'></a>").click(() => $parent_el.hide());
        $parent_el.prepend($a);
    }

    return {
        InitializeMenus,
        InitializeFoldMenu,
        GetInitialized,
        menus,
        GetSideMenu,
        AddCloseButton,
    }



}();
