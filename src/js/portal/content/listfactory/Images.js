Portal = Portal || {};
Portal.ManageableLists.ListFactory = Portal.ManageableLists.ListFactory || {};

/**
 *
 * Lista messujen hallitsemiseen 
 *
 */
Portal.ManageableLists.ListFactory.Images = function(){

        this.keys = ["name", "description", "resp_name", "day", "time_and_place"];
        this.addhtml = (`
                    <section>
                        <form name='imgform' id="imguploadform" action="${Utilities.GetAjaxPath('Saver.php')}">
                            <div><input type="text" name="test" /></div>
                            <div class='label-parent some-margin'>
                                <div>Kuvan lataus</div>
                                <div><input id="uploadImage" type="file" accept="image/*" name="image" /></div>
                                <div id="preview"></div>
                            </div>
                        </form>
                    </section>
                `);

        /**
         *
         * @param raw_data tarvittavat tiedot tietokannasta
         * @param $li muokattava ja palautettava listaelementti
         *
         */
        this.AddListRow = function(raw_data, $li){
            $li.find("span").text(raw_data.name);
            $.each(this.keys.concat(["id"]), (idx, key) => {
                $li.append(`<input type='hidden' class='${key}-container' 
                    value='${raw_data[key]}'></input>`)
            }
            );
            $li.append(`<input type='hidden' class='is_active-container' 
                value='${raw_data.is_active}'></input>`);
            return $li;
        }

        /**
         *
         * Nåyttää ikkunan, jossa voi muokata yhtä listan alkiota.
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.EditEntry = function(){
            //var selector = "#list_editor .edit_container .",
            //    checked = this.$current_li.find(".is_active-container").val()*1;
            //this.PrintEditOrAdderBox(this.addhtml);
            //$.each(this.keys, (idx, key) => {
            //    var oldval = this.$current_li.find("." + key + "-container").val();
            //    $(selector + key).val(oldval);
            //});
            //if(checked){
            //    $(selector + "is_active").get(0).checked = true;
            //}
        };


        /**
         *
         * Tulostaa muokkauslaatikon tai uuden lisäämislaatikon
         *
         * @param htmlstring mikä sisältö laatikolle annetaan
         *
         */
        this.PrintEditOrAdderBox = function(htmlstring){
            $("#list_editor .edit_container").html("");
            $(htmlstring).appendTo("#list_editor .edit_container");
        }



        this.GetAddedParams = function(){
            return this.GetParams();
        };

        /**
         *
         * Tallentaa uudet lista-alkiot: korvaa oletusmetodin
         *
         */
        this.SaveAdded = function(){
            //$("#imguploadform").on("submit", (e) => {
            //   e.preventDefault() ;
            //   let fd = new FormData(e.target);
            //   $.ajax({
            //       type: post,
            //       url: Utilities.GetAjaxPath("Saver.php"),
            //       data: fd,
            //       success: (d) => console.log(d)
            //   };
            //   //for (var [key, value] of fd.entries()) { 
            //   //  console.log(key, value);
            //   //}
            //});
            //$("#imguploadform").submit();
        };



        /**
         *
         * Lisää uuden alkion listaan.
         *
         * TODO kaikille tyypeille yhteinen lähtötilanne?
         *
         */
        this.AddEntry = function(){
            this.OpenBox();
            this.PrintEditOrAdderBox(this.addhtml);
            this.AddSaveButton(this.SaveAdded);
        };


        /**
         *
         * Hakee alkion poistoa varten tarvittavat listatyyppikohtaiset parametrit
         *
         * @param $li se listan alkio, jota ollaan poistamassa.
         *
         */
        this.GetRemoveParams = function($li){
            var params =  {
                "action" : "remove_image",
                "id" : $li.find(".id-container").val()
            };
            return params;
        }


        /**
         *
         * Hakee alkion muokkauksessa muuttuneet  parametrit
         *
         *
         */
        this.GetEditParams = function(){
            return  {
                 "cols" : this.GetParams(),
                 "id" : this.$current_li.find(".id-container").val(),
                }
        }


};
//e.preventDefault();
//  $.ajax({
//         url: "ajaxupload.php",
//   type: "POST",
//   data:  new FormData(this),
//   contentType: false,
//         cache: false,
//   processData:false,
//   beforeSend : function()
//   {
//    //$("#preview").fadeOut();
//    $("#err").fadeOut();
//   },
//   success: function(data)
//      {
//    if(data=='invalid')
//    {
//     // invalid file format.
//     $("#err").html("Invalid File !").fadeIn();
//    }
//    else
//    {
//     // view uploaded file.
//     $("#preview").html(data).fadeIn();
//     $("#form")[0].reset(); 
//    }
//      },
//     error: function(e) 
//      {
//    $("#err").html(e).fadeIn();
//      }          
//    });
// }));
