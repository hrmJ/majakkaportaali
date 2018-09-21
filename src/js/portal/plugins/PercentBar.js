Portal = Portal || {};

/**
 *
 * Simppeli moduuli prosenttipalkkien näyttämiseen
 *
 */
Portal.PercentBar = function(){

    var all_bars = [];

    /**
     *
     * Luokka, joka edustaa prosenttipalkkeja
     *
     * @param $parent_el div, joka sisältää palkin arvot
     *
     */
    var PercentBar = function($parent_el){
        this.numerator = $parent_el.find(".numerator").val();
        this.denominator = $parent_el.find(".denominator").val();
        this.$parent_el = $parent_el;


        /**
         *
         * Tulostaa prosenttipalkin
         *
         */
        this.PrintBar = function(){
            var width = this.numerator / this.denominator * 100,
                $numerator = $("<div class='numerator'></div>").css({"width":width + "%"}),
                $denominator = $("<div class='denominator'></div>"),
                $bar_parent = $("<div class='pcbar_parent'><div class='amounts'></div></div>");
            this.$parent_el.find("div.demonimator").remove();
            $denominator
                .append($numerator)
                .prependTo($bar_parent);
            $bar_parent
                .appendTo(this.$parent_el);
        };

        /**
         *
         * Lisää palkin sisälle numerot
         *
         */
        this.AddNumbersAsText = function(){
            this.$parent_el.find(".amounts")
                .append(`
                    <div>${this.numerator} €</div>
                    <div>${this.denominator} €</div>
                    `);
        };

        /**
         *
         * Valitsee palkin värin
         *
         * @param col uusi väri
         *
         */
        this.SetBarColor = function(col){
            this.$parent_el.find(".pcbar_parent").css({"color":col});
            this.$parent_el.find(".pcbar_parent div.denominator")
                .css({"border": "1px solid " + col});
            this.$parent_el.find(".pcbar_parent div.numerator")
                .css({"background": col});
        };

    };


    /**
     *
     * @param d DOM, josta etsitään 
     * @param d barcolor minkä värisiä palkkeja
     *
     */
    function InitializePercentBars(d, barcolor){
        d.find(".percent_bar").each(function(){
            var bar = new PercentBar($(this));
            bar.PrintBar();
            bar.SetBarColor(barcolor);
            bar.AddNumbersAsText();
            all_bars.push(bar);
        });
        console.log("Initialized the percent bars");
    }

    /**
     *
     * Hae kaikki käytöss olevat prosenttipalkit
     *
     */
    function GetBars(){
        return all_bars;
    }

    /**
     *
     * Päivittää prosenttipalkkien tyylit oikean värisiksi yms.
     *
     * TODO: jos useita prosenttipalkkeja samassa esityksessä
     *
     */
    function UpdateStyles(){
        var pres = Slides.Presentation.GetCurrentPresentation(),
            $pbarticle = pres.d.find(".percent_bar:eq(0)");
       if($pbarticle.length) {
            var $pbsection = $pbarticle.parents("section"),
                cl = $pbsection.attr("class").split(" ")[1],
                rule = pres.styles.GetRule("." + cl + " p"),
                col = rule.cssText.replace(/.*color: ([^;]+).*/, "$1");

            $.each(all_bars, function(idx, bar){
                bar.SetBarColor(col);
            });
       }
    
    }


    return {
    
        InitializePercentBars,
        GetBars,
        UpdateStyles,
    
    };

}();

