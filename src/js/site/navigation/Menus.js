/**
 *
 * Yksinkertainen, koko ruudun peittävä menu
 *
 **/


var Menus = function(){


    var Covermenu = function(){
    
        /**
         *
         * Avaa oikean menun, kun klikattu oikeaa linkkiä
         *
         * @param $launcher menu-klikkauksen laukaissut linkki
         *
         **/
        this.OpenMenu = function($launcher){
            var target = $launcher.attr("class").replace(/.*covermenu-target_(songlist)/g, "$1");
            $("#" + target).show();
            BlurContent();
        }


        /**
         *
         * Alusta itse menujen toiminnallisuus:
         * sulkulinkki ym.
         *
         **/
        this.Initialize = function(){
           var self = this;
           console.log("Initializing cover menus...");
           var $closerdiv = $(`
                <div class='closer_div' id='close_covermenu'>
                    <a href='javascript:void(0);'>Sulje valikko</a>
                </div>`);
            $closerdiv.click(function(){
                $(this).parents(".covermenu").hide();
                $(".blurcover").remove();
            });
            $(".covermenu").find('.closerdiv').remove();
            $(".covermenu").append($closerdiv.clone(true));
            $(".covermenu-launcher").click(function(){self.OpenMenu($(this))});
        }
        
    }

    var Covermenu = new Covermenu();



    return {
        Covermenu,
    }



}();
