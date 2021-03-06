Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.StyleWidgets = Slides.Widgets.StyleWidgets || {};

/**
 * Widget, jonka avulla tietokannasta voi ladata valmiita tyylipohjia
 * tai näitä tyylipohjia voi päivittää tai lisätä kokonaan uusia.
 *
 */
Slides.Widgets.StyleWidgets.LayoutLoader = function(parent_presentation){

    Slides.Widgets.LayoutWidget.call(this, parent_presentation);

    this.adderclass = ".layoutloader";
    this.$select = $(".layoutloader select");

    /**
     *
     * Lisää select-elementtiin kaikki tietokannassa olevat tyyliluokat.
     * Tämän jälkeen tekee elementistä jquery ui:n muokatun selectmenu-widgetin.
     *
     */
    this.UpdateStyleSheets = function(){
        var self = this,
            path = Utilities.GetAjaxPath("Loader.php");
        //Tallenna ennestäään olemassa olleiden tyylien nimet
        self.oldsheets = [];
        //Tyhjennä olemassaoleva sisältö
        this.$select.find("*").remove();
        $.getJSON(path,{ "action": "load_stylesheets"},
            function(data){
                $.each(data,function(idx, sheet){
                    self.$select.append("<option>" + sheet + "</option>");
                    self.oldsheets.push(sheet);
                })
                //Lisää tekstikentäksi muutettava option-elementti uudelle luokalle
                self.$select.append("<option>Uusi luokka</option>");
                //Luo widget
                self.$select.select_withtext();
            }
        );
    };

    /**
     *
     * Liitä tyylintallennuspainikkeisiin niitä koskevat tapahtumat
     *
     */
    this.InitializeEvents = function(){
        var self = this;
        $("#save_stylesheet").click(function(){self.Save()});
        $("#load_stylesheet").click(function(){self.Load()});
        $("#remove_stylesheet").click(function(){self.Remove()});
    };

    /**
     *
     * Tallenna muokattu tyylipohja
     *
     */
    this.Save = function(){
        var self = this,
            current_sheet = this.$select.val(),
            path = Utilities.GetAjaxPath("Loader.php"),
            real_classes = this.pres.classes.map((cl) => (cl.substr(0,1) == "." ? cl : "." + cl));

        $.getJSON(path,
            {
                "action": "styles_as_array",
                "current_sheet":current_sheet,
            },
            function(old_styles){
            //Hae ensin tietokannasta tiedot siitä, mitä arvoja tyyleillä on ollut ennen edellistä muokkausta

            //Hae sitten kaikki esityksessä käytössä olevat tyylit.
            //Käy tyylit läpi yksitellen ja poimi ne, jotka
            //vastaavat valittua tyylitiedostoa
            var all_rows = [];
            for(var rule_idx in self.pres.styles.rules){
                    var rule = self.pres.styles.rules[rule_idx];
                    if(rule.selectorText){
                        if(rule.selectorText.indexOf(".")==0){
                            //Tutki niitä css-sääntöjä, joista on erikseen määritelty luokka
                            var attributes = rule.cssText.replace(rule.selectorText,"").replace(/\s*[{}]\s*/g,"").split(";");
                            //Ota talteen luokan nimi ja mahdollinen tägin nimi
                            var selector_units = rule.selectorText.match("(\.[a-öA-Ö]+) +([a-öA-Ö0-9]+)");
                            if(!selector_units){
                                var tagname = "";
                                var classname = rule.selectorText.trim();
                            }
                            else{
                                var tagname = selector_units[2];
                                var classname = selector_units[1];
                            }
                            if (real_classes.indexOf(classname) > -1){
                                // Tyylitaulun yksi rivi:
                                $.each(attributes,function(idx, attr){
                                    if(attr.indexOf(":")>-1){
                                        //Jaa attribuuttiksi ja arvoksi
                                        var av_pair = attr.split(":");
                                        // Lisää kok tyylitietokantaan syötettävä rivi...
                                        if(old_styles.indexOf([classname,tagname,av_pair[0].trim(),av_pair[1].trim()].join(";"))==-1){
                                            //..jos rivi on sellainen, ettei sellaista ole vanhastaan ollu tietokannassa, 
                                            // eli toisin sanoen jotain tietokannan rivin arvoa on muutettu
                                            all_rows.push({"classname":classname,"tagname":tagname,"attr":av_pair[0].trim(),"value":av_pair[1].trim(),"stylesheet":current_sheet});
                                        }
                                    }
                                })
                            }
                        }
                    }
            }
            //Ongelma: post-arvot liian suuria, jos kokonaan uusi tyyli
            if(self.oldsheets.indexOf(current_sheet)<0){
                //Jos käytetty kokonaan uutta tyylinimeä, pilkotaan 
                //TODO: korjaa asynkronisuus
                for(var i = 0; i<all_rows.length;i += 50){
                    var updatables = all_rows.slice(i, i+50);
                    $.post(path,
                        {
                            "action": "update_style_rows",
                            "rows_to_update":updatables,
                            "current_sheet":current_sheet, 
                            "isnew": "yes"
                        },
                        function(data){
                            //$("body").prepend(data);
                            console.log("NEW styles updated.")
                            if(i+50>= all_rows.legth){
                                msg = new Utilities.Message(`${current_sheet}-tyylipohja tallennettu.`, $(".layoutloader"));
                                msg.Show(3000);
                            }
                        });
                    }
            }
            else{
                //Jos ei kokonaan uusi, post-ongelma ratkaistaan sillä, että päivitetään vain muuttuneet tyylit
                $.post(path,
                    {
                        "action": "update_style_rows",
                        "rows_to_update":all_rows,
                        "current_sheet":current_sheet,
                        "isnew": "no"
                    },
                    function(data){
                            //$("body").prepend(data);
                            console.log("Old styles updated.")
                            msg = new Utilities.Message(`${current_sheet}-tyylipohja päivitetty.`, $(".layoutloader"));
                            msg.Show(3000);
                    });
            }

            });
    };

    /**
     *
     * Lataa select-elementillä valittu tyylipohja 
     *
     */
    this.Load = function(){
        var self = this,
            sheetname = self.$select.val(),
            path = Utilities.GetAjaxPath("Loader.php");
        console.log("loading " + sheetname);
        self.pres.d.find("#updated_styles").html("").load(
            path,
            {
                "action": "load_styles",
                //"classes":self.pres.classes,
                "stylesheet":sheetname
            },
            function(){
                self.pres.styles.GetOriginalStyles();
                Slides.Styles.Controller.UpdateControllers(self.pres);
                var msg = new Utilities.Message(`${sheetname}-tyylipohja ladattu.`, $(".layoutloader"));
                msg.Show(3000);
            });
    };

    /**
     *
     * Poista select-elementillä valittu tyylipohja 
     *
     */
    this.Remove = function(){
        var self = this;
        console.log("remove");
    };

};


Slides.Widgets.StyleWidgets.LayoutLoader.prototype = Object.create(Slides.Widgets.LayoutWidget.prototype);

