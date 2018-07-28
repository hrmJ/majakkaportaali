/**
 * Layoutwidget, jolla muutetaan esityksen taustakuvaa tai taustaväriä. Mahdollistaa
 * myös segmenttikohtaisten taustakuvien määrittämisen
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 *
 */
var BackgroundChanger = function(parent_presentation){
    LayoutWidget.call(this, parent_presentation);
    this.LoadLocalBackgrounds();
    this.InitializeEvents();
    return this;
}

/**
 *
 * @param string adderclass sisällön lisävän widgetin css-luokka
 *
 */
BackgroundChanger.prototype = {
    adderclass: ".backgroundchanger",

    /**
     *
     * Lataa kaikki tähän widgettiin liittyvät tapahtumat
     *
     */
    InitializeEvents: function(){
        var self = this;
        $(".imgselect, .colselect").hide();
        $("[name='img_or_color']").click(function(){
            //Näytä käyttäjän valinnasta riippuen joko taustakuvan tai -värin valntalaatikko
            $(this).get()[0].checked = true;
            if($("[name='img_or_color']:checked").val() == "img") {
                $(".backgroundchanger .imgselect").show();
                $(".backgroundchanger .colselect").hide();
            }
            else{
                $(".backgroundchanger .imgselect").hide();
                $(".backgroundchanger .colselect").show();
            }
        })
        $(".bg-switcher .layout-save-changes").click(function(){self.ChangeBackground()});
        $(".content-bg-switcher .layout-save-changes").click(function(){self.ChangeContentBackground()});
        $(".backgroundchanger").find(".spectrum").spectrum({ showAlpha:true });

    },




    /**
     *
     * Lataa saatavilla olevat taustakuvat tietokannasta
     *
     */
    LoadLocalBackgrounds: function(){
        //Tyhjennä vanha select-elementin sisältö kaiken varalta
        $("#general-bg-select").html("").on("change",function(){
            //Lisää esikatselumahdollisuus 
            Preview($(this).parents(".with-preview"),"backgrounds/" + $(this).val())
            //Lataa kuvaus ko. kuvasta
            $.getJSON("php/loadassets.php",{"asset_type":"backgrounds","filename":$(this).val()},
                    function(data){ 
                        $("#general-bg-select").parent().find("p").text(data[0]);
                    });
        });
        //Lataa data select-elementtiin
        $.getJSON("php/loadassets.php",{"asset_type":"backgrounds"},
                function(data){
                    $.each(data, function(idx,bgname){
                        $("<option>").text(bgname).appendTo("#general-bg-select") ;
                        } 
                    );
                });

        },

            
    /**
     *
     * Toteuttaa käyttäjän tekemät koko ruudun taustoja koskevat muutokset, ja asettaa taustaksi
     * joko kuvan tai värin.
     *
     */
    ChangeBackground: function(){
        var rules_to_edit = this.pres.styles.SetEditTarget("nolevel");
        if($("[name='img_or_color']:checked").val() == "img") {
            var bg = "url(../../assets/backgrounds/" + $("#general-bg-select").val() +")";
        }
        else{
            var bg = $("#bgcolselect").spectrum("get").toRgbString();
        }
        $.each(rules_to_edit,function(idx,rule){
            rule.style.background = bg;
            //This might be kind of a hack:
            rule.style.backgroundSize = "100%";
        });
    },

    /**
     *
     * Toteuttaa käyttäjän tekemät siaältöalueiden taustoja koskevat muutokset,
     * ja asettaa taustaksi joko kuvan tai värin.
     *
     */
    ChangeContentBackground: function(){
        var rules_to_edit = this.pres.styles.SetEditTarget("nolevel",false," article");
        var bg = $("#content_bgcolselect").spectrum("get").toRgbString();
        $.each(rules_to_edit,function(idx,rule){
            rule.style.background = bg;
        });
    },


} 

extend(LayoutWidget, BackgroundChanger);
