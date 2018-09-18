Portal = Portal || {};

Portal.AdditionalInfoBoxes = function(){

    var apath = Utilities.GetAjaxPath("Loader.php");

    AdditionalInfoBox = function(){
    
        this.LoadData = function(){
            var season = Portal.Servicelist.GetCurrentSeason();
            $.getJSON(apath, 
                {
                    "action":this.action,
                    "startdate": season.startdate,
                    "enddate": season.enddate
                },
                this.PrintList.bind(this));
        };

        /**
         *
         * Tulostaa koko infolaatikon sisällön listana
         *
         *
         */
        this.PrintList = function(data){
            $(this.list_id).html("");
            $.each(data, this.PrintRow.bind(this));
        };

        /**
         *
         * Tulostaa yhden listan alkion
         *
         * @param idx dataelementin järjestysnumero
         * @param rowdata dataelementti
         *
         */
        this.PrintRow = function(idx, rowdata){
            var $li = this.ProcessDataRow(rowdata);
            $li.click(this.ShowRowDetails.bind(this))
                .appendTo(this.list_id);
        };

        /**
         *
         * Näyttää pienen ikkunan, jossa on tarkempaa tietoa yhdestä listan rivistä
         *
         * @param e klikkaustapahtuma
         *
         */
        this.ShowRowDetails = function(e){
            var $target = $(e.target);
            if ($target.get(0).tagName !== "LI"){
                $target = $target.parents("li");
            }
            var msg = new Utilities.Message($target.find("input").val(), 
                $target);
            msg.SetTitle($target.find(".item_header").text());
            msg.AddCloseButton();
            msg.Show(99999);
        };
    };


    /**
     *
     * Infolaatikko tapahtumista
     *
     */
    EventInfoBox = function(){
        this.action = "future_events";
        this.list_id = "#eventlist";
        AdditionalInfoBox.call(this);

        /**
         *
         * Syöttää datan li-elementtiin
         *
         * @param row tietokannasta tullut yhden tapahtuman tiedot sisältävä oliio
         *
         */
        this.ProcessDataRow = function(row){
                raw_date = $.datepicker.parseDate("yy-mm-dd", row.event_date);
                event_date =  $.datepicker.formatDate('dd.mm', raw_date);
                return $(`<li>
                    <div><strong>${event_date}:</strong></div>
                    <div class='item_header'>${row.name}</div>
                    <input type='hidden' value='${row.place_and_time + ". " + row.description}'></input>
                </li>`);
        };

    };

    EventInfoBox.prototype = Object.create(AdditionalInfoBox.prototype);

    /**
     *
     * Infolaatikko pienryhmistä
     *
     */
    SmallGroupInfoBox = function(){
        this.action = "mlist_Smallgroups";
        this.list_id = "#smallgrouplist";
        AdditionalInfoBox.call(this);

        /**
         *
         * Syöttää datan li-elementtiin
         *
         * @param row tietokannasta tullut yhden tapahtuman tiedot sisältävä oliio
         *
         */
        this.ProcessDataRow = function(row){
                return $(`<li>
                    <div class='item_header'>${row.name}</div>
                    <div>(${row.day})</div>
                    <input type='hidden' value='${row.description}'></input>
                </li>`);
        };

    };

    SmallGroupInfoBox.prototype = Object.create(AdditionalInfoBox.prototype);

    /**
     *
     * Infolaatikko kommenteista
     *
     */
    CommentInfoBox = function(){
        this.action = "load_latest_comments";
        this.list_id = "#commentlist";
        AdditionalInfoBox.call(this);

        /**
         *
         * Syöttää datan li-elementtiin
         *
         * @param row tietokannasta tullut yhden tapahtuman tiedot sisältävä oliio
         *
         */
        this.ProcessDataRow = function(row){
            var commentator = (row.commentator ? ` (${row.commentator})` : '');
                raw_date = $.datepicker.parseDate("yy-mm-dd", row.comment_time.replace(/ .*/g,'')),
                event_date =  $.datepicker.formatDate('dd.mm', raw_date),
                meta = `<div><strong>${event_date}</strong></div>`;
                return $(`<li>
                    ${meta}
                    <div>${row.content} ${commentator}</div>
                    <input type='hidden' class='comid' value='${row.service_id}'></input>
                    </li>`);
        };


        /**
         *
         * Siirtyy messuun, jossa kommentti annettu
         *
         * @param e klikkaustapahtuma
         *
         */
        this.ShowRowDetails = function(e){
            var $target = $(e.target);
            if ($target.get(0).tagName !== "LI"){
                $target = $target.parents("li");
            }
            var id = $target.find(".comid").val();
            window.location =  "service.php?service_id=" + id;
        }

    };

    CommentInfoBox.prototype = Object.create(CommentInfoBox.prototype);

    return {
        EventInfoBox,
        SmallGroupInfoBox,
        CommentInfoBox,
    };

}()
