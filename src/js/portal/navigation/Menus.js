var Portal = Portal || {};

/**
 *
 * Moduuli erilaisille menuille
 *
 **/
Portal.Menus = function(){

    var menus = {},
        sidemenu = undefined,
        initialized = false,
        original_container_height = undefined;

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
        this.last_action = undefined;
        this.action_before_menu = undefined;
        this.$menu = $("#" + name);
        this.$launcher = $(".covermenu-target_" + this.name);
        this.opened = false;
        //Tallenna tieto siitä, avattiinko menu toisen päälle
        this.open_before = undefined;


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

            //Lisää tapahtuma, joka tarkkailee menun pituutta yms
            this.$menu.find("*").click(this.FitInContainer.bind(this))
        }

        /**
         *
         * Tarkkaile menun korkeutta ja sovita ylemmän tason konttiin
         *
         */
        this.FitInContainer = function(){
            var $cont = this.$menu.parents("main");
            // ensin varmista, että menu on tarpeeksi korkea kattamaan kaikki lapsensa
            //this.$menu.height(this.$menu.get(0).scrollHeight);
            if(this.$menu.is(":visible")){
                //Tee vain, jos menu on näkyvissä eli auki
            
                var heights = {
                    menu: this.$menu.height(),
                    container: $cont.height(),
                }

                if (heights.menu > heights.container){
                    //Menu korkeampi kuin sisältö
                    $cont.css({"min-height":heights.menu});
                }
                if(heights.menu < heights.container){
                    //Sisältö korkeampi kuin menu
                    console.log("menu TOO low, do something!");
                    this.$menu.css({"min-height": heights.container});
                    //this.$menu.css({"padding-bottom":(heights.container - heights.menu) + "px"});
                    //this.$menu.height(heights.container - heights.topmargin);
                }
            };

        };


    
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

            //TODO: Test if a menu already open when opening a new one
            this.open_before = undefined;
            $.each(menus, (idx, menu) => {
                if(menu.opened){
                    this.open_before = menu;
                    return 0;
                }
            });

            //Tallenna viimeisein klikkaustapahtuma, jotta sen kohteeseen voidaan palata
            this.$menu.find(".fa,li,a").click((e)=> this.last_action = e.target);

            this.opened = true;
            $(".covermenu").hide();

            //Tallenna sisällön alkuperäinen korkeus, jotta se voidaan palauttaa
            if(!original_container_height){
                original_container_height = this.$menu.parents("main").height();
            }
            this.$menu.show();
            //Utilities.BlurContent();
            if(sidemenu)
                sidemenu.Close();
            //Varmista, että korkeus on oikea suhteessa konttiin
            this.FitInContainer();
            this.observer = new MutationObserver(this.FitInContainer.bind(this));
            this.observer.observe(this.$menu.get(0), {attributes:true, childList: true, subtree:true});
            
        }

        /**
         *
         * Sulkee oikean menun, kun klikattu oikeaa linkkiä
         *
         *
         **/
        this.CloseMenu = function(){
            this.opened = false;
            if(this.observer){
                this.observer.disconnect();
            }
            this.$menu.hide();
            //Palauta alkuperäinen korkeus kontille
            //this.$menu.parents("main").height(original_container_height);
            this.$menu.parents("main").css({"min-height": ""});
            this.$menu.css({"min-height": ""});
            //console.log(this.$menu.parents("main").height());
            if (this.open_before){
                //Jos menu avattu päälle, avaa alimmainen
                this.open_before.OpenMenu();
                if (this.open_before.last_action){
                    if(this.open_before.last_action){
                        //Palauta näkymä
                        $("body").scrollTo(this.open_before.last_action,100);
                    }
                }
            }
            else{
                if(this.action_before_menu){
                        $("body").scrollTo(this.action_before_menu,100);
                }
            }
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
