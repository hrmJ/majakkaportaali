Slides = Slides || {};
Slides.Widgets = Slides.Widgets || {};
Slides.Widgets.ContentAdders = Slides.Widgets.ContentAdders || {};

/**
 *
 * Tekstidian lisäävä widget
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 * @param string adderclass sisällön lisävän widgetin css-luokka
 * @param string addedclass itse sisällön css-luokka
 *
 */
Slides.Widgets.ContentAdders.ImageAdder = function(parent_presentation){

    Slides.Widgets.ContentAdder.call(this, parent_presentation);

    this.adderclass = ".imageadder";
    this.addedclass = "addedcontent";

    /**
     * Luo kuvadian
     */
    this.CreateContent = function(){
        //var $content = $("<article class='added-text'></article>").text($(".textcontentadder textarea").val());
        //this.$loaded_content =  this.GiveContainer().append($content);
    };

    /**
     *
     * Alustaa toiminnallisuuden 
     *
     */
    this.Initialize = function(){
        var reader = new FileReader()
            self = this;
        $("#imgadder_pick_local").on("change", () => {
            reader.onload = function (e) {
                var filename = $("#imgadder_pick_local").val().replace(/.*(\/|\\)([^.]+.\w+)/,"$2");
                alert("MLKL");
                self.$loaded_content = $(`<section class="infocontent Teksti" style="display: flex;">
                    <article class="">
                        <input type="hidden" value="${filename}">
                        <div class="img-wholescreen">
                            <img src=${e.target.result}>
                        </div>
                    </article>
                </section>`);
            }
            reader.readAsDataURL($("#imgadder_pick_local").get(0).files[0]);
        });
    };

}

Slides.Widgets.ContentAdders.ImageAdder.prototype = Object.create(Slides.Widgets.ContentAdder.prototype);
