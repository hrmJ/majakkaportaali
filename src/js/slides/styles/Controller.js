Slides = Slides || {};
Slides.Styles = Slides.Styles || {};

Slides.Styles.Controller = function(){

    /**
     *
     * Tallentaa esitysikkunaan ladatut tyylit sekä mahdollistaa niiden muokkauksen ja
     * muokkausten tallentamisen
     *
     * @param object pres Esitys, jonka tyylejä hallitaan
     * @param object rule_indexes hash, joka tallentaa sen, minkänumeroinen sääntö (säännöt) mistäkin tägistä tai luokasta vastaa
     *
     */
    var StyleController = function(pres){
        this.pres = pres;
        this.rule_indexes = {};

        /**
         *
         * Hae alkuperäiset, esityksessä oletuksena käytetyt tyylit
         *
         */
        this.GetOriginalStyles = function(){
            //TODO: explorerissa pelkkä rules
            this.rules = {};
            var self = this,
                rule = undefined;
            //Yhdistä alkuperäiset tyylit ja tietokanasta ladatut muokatut tyylit
            for(var key in this.pres.dom.styleSheets[0].cssRules){
                this.rules[key] = this.pres.dom.styleSheets[0].cssRules[key];
            }
            for(var key in this.pres.dom.styleSheets[1].cssRules){
                this.rules[(key*1)+(this.rules.length)] = this.pres.dom.styleSheets[1].cssRules[key];
            }
            this.rule_indexes = {};
            // Etsi tämän jälkeen näitä vastaavat cssRules-taulukon indeksit 
            for(var rule_idx in this.rules){
                if(!isNaN(rule_idx*1)){
                    rule = this.rules[rule_idx];
                    if(rule.selectorText){
                        this.rule_indexes[rule.selectorText] = rule_idx;
                    }
                }
            }
            //$.each(self.rules,function(idx,rule){
            //    console.log(idx + ": " + rule);
            //    if(rule.selectorText){
            //        self.rule_indexes[rule.selectorText] = idx;
            //        console.log(rule.selectorText);
            //    }
            //});
        
        };

        /**
         * Palauttaa level-attribuutin mukaisen css-säännön
         *
         * @param string selector css-selectori, jonka perusteella sääntö etsitään
         *
         * @returns object selector-attribuutin mukaista selektoria vastaava css-tyyli
         *
         */
        this.GetRule = function(selector){
               if(this.rules[this.rule_indexes[selector]]==undefined){
                   console.log("Warning: no such css rule as >>" + selector + "<<");
               }
               return this.rules[this.rule_indexes[selector]];
        };

        /**
         * Asettaa sen, miten laajasti käyttäjä on muokkaamassa ulkoasua.
         * Oletuksena koko esityksen laajuisesti, mutta valinnan mukaan myös joko
         * segmenttityyppi- tai segmenttikohtaisesti.  Käytännössä etsii kaikki ne
         * kohteet, joita muutos koskee ja palauttaa yksittäisille
         * muuttajafunktioille listan näistä kohteista.
         *
         * @param string level sen tekstitason (h1,h2,h3,p,body) nimi, jota muokkaus koskee
         * @param boolean force_all_levels jos pakotetaan muokkaamaan jokaista tekstitasoa erikseen (tämä on välttämätöntä, jos haluaa esim. muokata kerralla kaikkien tekstielementtien väriä)
         * @param string contentparent Määritelläänkö tyylimuutos erikseen sisällön taustalla olevalle elementille eikä koko ruudulle. Jos määritellään, arvoksi annetaan <välilyonti> + article
         *
         * @return Array lista säännöistä, joita muutos koskee
         *
         */
        this.SetEditTarget = function(level, force_all_levels, contentparent){
            if(force_all_levels==undefined) force_all_levels = false;
            if(contentparent==undefined) contentparent = "";
            var target = $("#layout-target_select").val();
            var self = this;
            var rules_to_edit = [];
            //Tarkista, onko kohteena luokka, ja jos on niin mikä
            var class_as_target = self.pres.classes.indexOf(target);

            if(level=="nolevel"){
                //A. Jos kyseessä ominaisuus, jota ei muokata tekstitasokohtaisesti
                if(target=="Koko esitys"){
                    $.each(self.pres.classes, function(idx,segment_type){
                        //Lisää kaikki eri segmenttityypit muokattavien sääntöjen listalle
                        rules_to_edit.push(self.GetRule("." + segment_type + contentparent)); 
                    });
                }
                else if(class_as_target>-1){
                    rules_to_edit.push(self.GetRule("." + self.pres.classes[class_as_target] + contentparent));
                }
            }
            else if(level=="body"){
                //B. Jos muokataan KAIKKIA tekstitasoja
                rules_to_edit.push(self.GetRule("body"));

                if(force_all_levels){
                    if(target=="Koko esitys"){
                        //Jos pakko muokata kaikkia tekstitasoja ja lisäksi kaikkia segmenttityyppejä
                        var classes = self.pres.classes;
                    }
                    else{
                        //Jos pakko muokata kaikkia tekstitasoja mutta vain tiettyä segmenttityyppiä
                        var classes = [self.pres.classes[class_as_target]];
                    }
                    $.each(classes.concat(["body"]), function(idx,segment_type){
                        //Lisää kaikki eri segmenttityypit muokattavien sääntöjen listalle
                        //Huomaa tyhjä 'tekstitaso' joka tarkoittaa tapauksia kuten ".song fontFamily" (tämä sen takia, että kaikki säätimet päivittyisivät niin kuin pitää)
                        $.each(["", "h1","h2","h3","p","img"],function(l_idx, lev){
                            //Lisää kaikki tekstitasot muokattavien sääntöjen listalle
                            var selector = (segment_type!="body" ? "."  : "") + segment_type + " " + lev;
                            rules_to_edit.push(self.GetRule(selector.trim())); 
                        });
                    });
                }
            }
            else{
                //C. Jos muokataan  VAIN TIETTYJÄ tekstitasoja tai esim. section-elementtejä

                //Koska segmenttityypit ovat section-tason elementtejä, poista näistä määrittelyistä erikseen sana "section"
                if(level=="section"){
                    level = "";
                    //Lisää erikseen body-tason sääntö, jos kyse section-elementeistä
                    if (target=="Koko esitys") rules_to_edit.push(self.GetRule("body section")); 
                }

                if(target=="Koko esitys"){
                    //1. Jos laajuus on koko esitys
                    $.each(self.pres.classes.concat(["body"]),function(idx,segment_type){
                        //Lisää kaikki eri segmenttityypit muokattavien sääntöjen listalle
                        var selector = (segment_type!="body" ? "."  : "") + segment_type + " " + level;
                        rules_to_edit.push(self.GetRule(selector.trim())); 
                    });
                }
                else if(class_as_target>-1){
                    //2. Jos laajuutena segmenttityypit
                        var selector = "." + self.pres.classes[class_as_target] + " " + level;
                        rules_to_edit.push(self.GetRule(selector.trim()));
                }
                else{
                    //3. Jos segmenttikohtaisesti
                    //TODO: tähän tarvitaan monimutkaisempaa logiikkaa...
                }
            }
            //Poista lopuksi säännöt, joita ei oikeasti ole, mutta joita silti yritetty hakea
            var real_rules = [];
            $.each(rules_to_edit,function(idx,rule){   
                if(rule!==undefined) real_rules.push(rule)
            })

            return real_rules;
        };

    }


    /*
     * Päivittää tyylisäädinten arvot sen pohjalta, mitä tallennetuissa
     * tyylipohjissa tai lennosta tehdyissä muokkauksissa on asetettu.
     *
     * @param object pres esitysolio
     *
     */
    function UpdateControllers(pres){
        var segment_type = $("#layout-target_select").val();
        if(segment_type=="Koko esitys") segment_type = "body";

        //Päivitä kaikki säätimet tallennettujen tai muokattujen css-sääntöjen mukaisiin arvoihin
        $(".fontcontroller, .positioncontroller").find(".adjuster").each(function(){
            //Etsi ensin kustakin säätimestä, mitä ominaisuutta sillä säädellään
            var target =$(this).parents(".fontcontroller,.positioncontroller").attr("class").match(/(\w+)-changer-parent/i)[1];
            //Etsi myös, mitä tekstitasoa tämä säädin säätää
            var level =$(this).parents(".changer-parent").attr("class").match(/level-(\w+)/i)[1];
            var this_segment_type = (segment_type=="body" ? segment_type : "." + segment_type);
            var thislevel = (level=="body" ? this_segment_type : this_segment_type +  " " + level);

            //Määrittele ensin, onko tämä säädin käytössä
            if(!$(this).parents(".positioncontroller, .fontcontroller").hasClass("controller-not-in-use")){

                if(pres.classes.indexOf(segment_type)>-1 && level == "section"){
                    //Huomioi, että section-tason säännöillä section-sana jätetään segmenttityyppikohtaisissa luokissa toistamatta
                    thislevel = thislevel.replace(/section/,"").trim();
                }
                if($(this).hasClass("slider")){
                    //Numeeriset säätimet---------------------------------------------
                    if($(this).parents("section").hasClass("eltype-section")){
                        //Huom: section-tason elementeissä valitse aina sama *body selection* -css-sääntö
                        var newval = pres.styles.GetRule("body section").style[target].replace(/(em|vh|vw).*/,"")*1;
                    }
                    else{
                        var newval = pres.styles.GetRule(thislevel).style[target].replace(/(em|vh|vw).*/,"")*1;
                    }
                    // Jos ei saatu järkevää arvoa, käytetään oletusta
                    if(isNaN(newval)){
                        newval = $(this).parents("div").find(".defaultvalue").val()*1;
                    }
                    $(this).slider("value",newval);
                }
                else if($(this).hasClass("spectrum")){
                    //Värisäätimet---------------------------------------------
                    if(["border"].indexOf(target)>-1){
                        $(this).spectrum("set",pres.styles.GetRule(thislevel).style[target].replace(/.*solid /,""));
                    }
                    else{
                        $(this).spectrum("set",pres.styles.GetRule(thislevel).style[target]);
                    }
                }
                else if($(this).hasClass("select")){
                    //Pudotusvalikot---------------------------------------------
                    var selectval = pres.styles.GetRule(thislevel).style[target];
                    //Poista ylimääräiset lainausmerkit
                    var selectval = selectval.replace(/\"/g,"");
                    if(selectval){
                        //Fontteja aseteltaessa poista pilkulla erotellut fallbackit kuten Roboto, serif
                        if(target=="fontFamily") selectval = selectval.replace(/,.*/,"");
                        $(this).val((selectval)).selectmenu("refresh");
                    }
                }
            }
            else{
                //Jos halutaan palauttaa asetus auto-asentoon ja esitys on jo käynnissä
                var controllername = ($(this).parents(".fontcontroller, .positioncontroller").hasClass("fontcontroller") ? "fontchanger" : "positionchanger");
                if(pres.controls.hasOwnProperty(controllername))
                    pres.controls[controllername].Change($(this),"auto");
            }
        });

        Portal.PercentBar.UpdateStyles();
    }


    return {
    
        StyleController,
        UpdateControllers
    }

}();


