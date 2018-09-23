Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.StyleWidgets = Slides.Widgets.StyleWidgets || {};

/**
 * Layoutwidget, jolla muutetaan esityksen taustakuvaa tai taustaväriä. Mahdollistaa
 * myös segmenttikohtaisten taustakuvien määrittämisen
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param string adderclass sisällön lisävän widgetin css-luokka
 *
 */
Slides.Widgets.StyleWidgets.BackgroundChanger = function(parent_presentation){
    Slides.Widgets.LayoutWidget.call(this, parent_presentation);
    this.adderclass = ".backgroundchanger";

    /**
     *
     * Lataa kaikki tähän widgettiin liittyvät tapahtumat
     *
     */
    this.InitializeEvents = function(){
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

    };




    /**
     *
     * Lataa saatavilla olevat taustakuvat tietokannasta
     *
     */
    this.LoadLocalBackgrounds = function(){
        var path = Utilities.GetAjaxPath("Loader.php");
        //Tyhjennä vanha select-elementin sisältö kaiken varalta
        $("#general-bg-select").html("").on("change",function(){
            //Lisää esikatselumahdollisuus 
            Utilities.Preview($(this).parents(".with-preview"), $(this).val())
            //Lataa kuvaus ko. kuvasta
            $.getJSON(path,{
                //"asset_type":"backgrounds",
                "action": "get_slide_image_description",
                "filename":$(this).val()
                },
                    function(data){ 
                        $("#general-bg-select").parent().find("p").text(data[0]);
                    });
        });
        //Lataa data select-elementtiin
        $.getJSON(path, {
                "action":"get_slide_image_names"
                },
                function(data){
                    var options = data.map((bgname) => `<option>${bgname.filename}</option>`);
                    $("#general-bg-select").append(options);
                });

        };

            
    /**
     *
     * Toteuttaa käyttäjän tekemät koko ruudun taustoja koskevat muutokset, ja asettaa taustaksi
     * joko kuvan tai värin.
     *
     */
    this.ChangeBackground = function(){
        var rules_to_edit = this.pres.styles.SetEditTarget("nolevel");
        if($("[name='img_or_color']:checked").val() == "img") {
            var bg = "url(../../assets/images/" + $("#general-bg-select").val() +")";
        }
        else{
            var bg = $("#bgcolselect").spectrum("get").toRgbString();
        }
        $.each(rules_to_edit,function(idx,rule){
            rule.style.background = bg;
            //This might be kind of a hack:
            rule.style.backgroundSize = "cover";
            rule.style.backgroundRepeat = "no-repeat";
        });
    };

    /**
     *
     * Toteuttaa käyttäjän tekemät siaältöalueiden taustoja koskevat muutokset,
     * ja asettaa taustaksi joko kuvan tai värin.
     *
     */
    this.ChangeContentBackground = function(){
        var rules_to_edit = this.pres.styles.SetEditTarget("nolevel",false," article");
        var bg = $("#content_bgcolselect").spectrum("get").toRgbString();
        $.each(rules_to_edit,function(idx,rule){
            rule.style.background = bg;
        });
    };


};

Slides.Widgets.StyleWidgets.BackgroundChanger.prototype = Object.create(Slides.Widgets.LayoutWidget.prototype);

