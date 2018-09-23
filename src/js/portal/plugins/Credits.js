Portal = Portal || {};

/**
 *
 * Simppeli moduuli listan näyttämiseen lopputekstimäisesti
 * TODO: jquery-plugin
 * TODO: intervallin säätö
 * TODO: animaation voi valita
 *
 */
Portal.Credits = function(){

    var all_lists = [],
        play_interval = 2100;

    /**
     *
     * Luokka, joka edustaa lopputekstimäisiä listoja
     *
     * @param $ul lista, jota pyöritetään (jquery-olio ul:stä)
     *
     */
    var CreditList = function($ul){
        this.$ul = $ul;
        this.current_idx = 0;

        /**
         *
         * Käynnistää krediittien pyörityksen
         * TODO: randomisti?
         *
         */
        this.Play = function(){
            setInterval(() => {
                this.$ul.find("li").hide();
                this.$ul.find("li:eq(" + this.current_idx + ")").fadeIn();
                if(this.current_idx + 1  < this.$ul.find("li").length){
                    this.current_idx++;
                }
                else{
                    this.current_idx = 0;
                }
            }, play_interval);
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
     *
     */
    function InitializeCredits(d){
        d.find(".credits_list").each(function(){
            var creditlist = new CreditList($(this));
            creditlist.Play();
            all_lists.push(creditlist);
        });
        console.log("This is how many: " + all_lists.length)
        console.log("Initialized the credit lists");
    }




    return {
    
        InitializeCredits,
    
    };

}();

