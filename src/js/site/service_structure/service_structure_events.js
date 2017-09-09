/**
 * Tapahtumat, jotka liittyvät messurakenteen määrittelyyn
 */

var adder = undefined;

$(document).ready(function(){
    if($("body").hasClass("service_structure")){

        /**
         *
         * Valitse, mitä sisältöä ryhdytään lisäämään. 
         * Valintamenun  (jqueryui menu) callback.
         *
         */
        function SelectTheContentToAdd(e, u){
            if(u.item.find("span").length==0){
                switch(u.item.text()){
                    //case "Yksittäinen dia":
                    //    break;
                    default:
                        adder = new InfoSlideAdder(u.item.parents(".structural-element-add"));
                        break;
                }
                adder.ShowWindow();
            }
        }

        $(".menu").menu({ position: { my: "bottom", at: "right-5 top+5" }, select: SelectTheContentToAdd});

    }
    }
);
