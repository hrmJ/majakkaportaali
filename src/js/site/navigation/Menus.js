

/**
 *
 * Moduuli erilaisille menuille
 *
 **/
var Menus = function(){

    menus = {};

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
                   <a href='javascript:void(0);'>Sulje valikko</a>
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
            this.$menu.show();
            Utilities.BlurContent();
        }

        /**
         *
         * Sulkee oikean menun, kun klikattu oikeaa linkkiä
         *
         *
         **/
        this.CloseMenu = function(){
            this.$menu.hide();
            $(".blurcover").remove();
        }
        
    }

    function InitializeMenus(){
    
        //Aseta taittovalikot toimintakuntoon
        $(".controller-subwindow").hide()
        $(".subwindow-opener").click(function(){ 
            //Avaa tai sulje tarkemmat fonttien muokkaussäätimet ym
            $(this).next().slideToggle(); 
            $(this).toggleClass("opened");
        });

        $(".covermenu").each(function(){
            var name = $(this).attr("id");
            menus[name] = new Covermenu(name);
            menus[name].Initialize();
        });

    
    }




    return {
        InitializeMenus,
        menus
    }



}();
