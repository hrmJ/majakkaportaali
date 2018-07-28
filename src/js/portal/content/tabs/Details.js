/**
 * Messun tiedot -välilehti. Yksittäisen messun aihe, raamatunkohdat
 * ja muu yleisen tason (ei ihmisiä koskeva )info, tämän muokkaus ym.
 *
 **/
Service.TabFactory.Details = function(){

    this.action = "save_details";
    this.bible_segments = [];


    /**
     *
     * Hakee messun teeman
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     *
     **/
    this.GetTheme = function(callback){
        $("#service_theme").on("change paste keyup",this.MonitorChanges.bind(this));
        $.get("php/ajax/Loader.php",{
            action: "get_service_theme",
            service_id: service_id
            }, callback.bind(this));
    };

    /**
     *
     * Vaihtaa messun teeman 
     *
     * @param theme uusi teema, joka messulle asetetaan
     *
     **/
    this.SetTheme = function(theme){
        $("#service_theme").val(theme);
        this.tabdata = this.GetTabData();
        $("#service_theme").on("change paste keyup",this.MonitorChanges.bind(this));
        //Tarkkaile muutoksia:
        
    };


    /**
     *
     * Hakee messuun liittyvät raamatunkohdat
     *
     * @param callback funktio, joka ajetaan kun lataus on valmis
     *
     *
     **/
    this.GetBibleSegments = function(callback){
        console.log("getting bible segments...");
        $.getJSON("php/ajax/Loader.php",{
            action: "get_service_verses",
            service_id: service_id
            }, callback.bind(this));
    };


    /**
     *
     * Hakee käikki tämän kontin sisältämät laulut
     *
     **/
    this.FetchSlots = function(){
        console.log("fetching.." + this.name);
        $.getJSON("php/ajax/Loader.php",{
            action: "load_slots_to_container",
            service_id: Service.GetServiceId(),
            cont_name: this.name
        }, this.SetSlots.bind(this));
    }

    /**
     *
     * Tallentaa messuun liittyvien raamatunkohtien sisällön
     *
     * @param segments messuun liittyvät raamatunkohdat
     *
     **/
    this.SetBibleSegments = function(segments){
        var $segment_list = $("#biblesegments_in_service").html(""),
            self = this;
        $.each(segments,function(idx, segment){
            var $li = $("<li class=''></li>").appendTo($segment_list);
            var picker = BibleModule.AttachAddressPicker($li, segment.slot_name);
            picker.SetCallBack(self.MonitorChanges.bind(self));
            picker.Initialize();
            self.bible_segments.push(picker);
        });
        this.SetBibleSegmentContent();
    };

    /**
     *
     * Hakee tietokannasta sen, mitä sisältöä raamatunkohtaslotteihin on määritelty
     *
     */
    this.SetBibleSegmentContent = function(){
        var self = this;
        $.getJSON("php/ajax/Loader.php",{
            action: "get_bible_segments_content",
            service_id: Service.GetServiceId(),
        }, function(data){
                $.each(self.bible_segments, function(idx, seg){
                    if(! data[seg.title]){
                        //Jos ei tallennettua dataa
                        return 0;
                    }
                    for(i=1;i<data[seg.title].length;i++){
                        seg.AddPickerPair();
                    }
                    $.each(seg.picker_pairs, function(pair_idx, picker_pair){
                        $.when(picker_pair.startpicker.SetAddress(
                            {
                            book: data[seg.title][pair_idx].startbook,
                            chapter: data[seg.title][pair_idx].startchapter,
                            verse: data[seg.title][pair_idx].startverse
                            },
                            data[seg.title][pair_idx].testament),
                            ).done(
                                function(){
                                    $.when(
                                    picker_pair.endpicker.SetAddress(
                                        {
                                        book: data[seg.title][pair_idx].endbook,
                                        chapter: data[seg.title][pair_idx].endchapter,
                                        verse: data[seg.title][pair_idx].endverse
                                        },
                                        data[seg.title][pair_idx].testament
                                        )).done(function(){
                                            picker_pair.Confirm();
                                            self.tabdata = self.GetTabData();
                                        });
                                }
                            )
                        });
                    });
            });
        

    };


    /**
     *
     * Kerää kaiken välilehden sisältämän datan joko tallentamista
     * varten tai jotta voitaisiin nähdä, onko tehty muutoksia.
     *
     **/
    this.GetTabData = function(){
        var data = [
                {"type":"theme","value":$("#service_theme").val()}
            ];
        $.each(this.bible_segments, function(idx, seg){
            $.each(seg.picker_pairs, function(pair_idx, picker_pair){
                var start = picker_pair.startpicker.GetAddress(),
                    end = picker_pair.endpicker.GetAddress();
                data.push({
                    type: "bible",
                    segment_name: seg.title,
                    service_id: Service.GetServiceId(),
                    testament: picker_pair.startpicker.testament,
                    startbook: start.book,
                    startchapter: start.chapter,
                    startverse: start.verse,
                    endbook: end.book,
                    endchapter: end.chapter,
                    endverse: end.verse,
                });
            });
        });
        return data;
    };



};

