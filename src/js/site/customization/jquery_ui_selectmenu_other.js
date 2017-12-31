/**
 *
 * Jquery ui:n selectmenu-pluginin muokkaus niin, että
 * mahdollista valita myös tekstikenttä.
 *
 */
 $.widget("custom.select_withtext", $.ui.selectmenu, 
     { 
         _renderItem: function( ul, item ) {
            if(item.label=="Uusi luokka"){
                //TODO: abstract this, so that these options can be set appropriately and don't have to be hard coded.
                var $input = $("<input type='text' placeholder='Uusi luokka...'>");
                $input.on("keydown",function(){
                    var $div = $(this).parents(".other-option");
                    if ($div.find("button").length==0){
                        $("<button>Lisää</button>")
                            .click(function(){
                                //Lisää äsken lisätty uusi arvo KAIKKIIN tällä sivulla oleviin select-elementteihin, joissa addedclass-nimi
                                var newval = $(this).parents(".other-option").find("input").val();
                                $("<option value='" + newval + "'> " + newval + "</option>")
                                    .insertBefore($("select[name='addedclass']").find("option:last-child"));
                                $("select[name='addedclass']").each(function(){
                                    try{
                                        $(this).select_withtext("refresh");
                                    }
                                    catch(e){
                                        $(this).select_withtext();
                                    }
                                });
                            })
                            .appendTo($div);
                    }
                });
            }
             else if(item.label=="Jokin muu"){
                var $input = $("<input type='text' placeholder='Jokin muu...'>")
                var self = this;
                var thisitem = item;
                $input.autocomplete( {
                    source: function(request, response){ $.getJSON(loaderpath + "/songtitles.php",{songname:request.term,fullname:"no"},response);},
                    minLength: 2,
                    select: function(event,input){
                        $(self.element).find("[value='Jokin muu']").before("<option>" +  input.item.value +"</option>");
                        self.refresh();
                    },
                });
            }

            var wrapper = (["Uusi luokka","Jokin muu"].indexOf(item.label)>-1 ? $("<div class='other-option'>").append($input) : $("<div>").text(item.label));

            return $("<li>").append(wrapper).appendTo(ul);
        },
        open: function( event ) {

            var self = this;
            $.each(this.menuItems,function(idx,el){
                if($(el).hasClass("other-option")){
                    //Siivoa tekstikenttään liittyvät tapahtumat
                    $(el).unbind('mousedown');
                    $(el).unbind('keydown');
                    $(el).unbind('click');
                    $(el).click(function(){return false;});
                    $(el).bind("keydown", function(event){});
                    $(el).bind('mousedown', function() {
                        //Fokus pitää asettaa erikseen
                        $(this).find('input:eq(0)').focus();
                    });
                }
            });
            if ( this.options.disabled ) {
                return;
            }

            // If this is the first time the menu is being opened, render the items
            if ( !this._rendered ) {
                this._refreshMenu();
            } else {

                // Menu clears focus on close, reset focus to selected item
                this._removeClass( this.menu.find( ".ui-state-active" ), null, "ui-state-active" );
                this.menuInstance.focus( null, this._getSelectedItem() );
            }

            // If there are no options, don't open the menu
            if ( !this.menuItems.length ) {
                return;
            }

            this.isOpen = true;
            this._toggleAttr();
            this._resizeMenu();
            this._position();

            this._on( this.document, this._documentClick );

            this._trigger( "open", event );
        },


	_drawMenu: function() {
		var that = this;

		// Create menu
		this.menu = $( "<ul>", {
			"aria-hidden": "true",
			"aria-labelledby": this.ids.button,
			id: this.ids.menu
		} );

		// Wrap menu
		this.menuWrap = $( "<div>" ).append( this.menu );
		this._addClass( this.menuWrap, "ui-selectmenu-menu", "ui-front" );
		this.menuWrap.appendTo( this._appendTo() );

		// Initialize menu widget
		this.menuInstance = this.menu
			.menu( {
				classes: {
					"ui-menu": "ui-corner-bottom"
				},
				role: "listbox",
				select: function( event, ui ) {
                    console.log("sel");
					event.preventDefault();

					// Support: IE8
					// If the item was selected via a click, the text selection
					// will be destroyed in IE
					that._setSelection();

                    if(ui.item.data( "ui-selectmenu-item" ).label!=="Jokin muu"){
                        that._select( ui.item.data( "ui-selectmenu-item" ), event );
                    }
                    else{
                        $(event.target).find
                    }
				},
				focus: function( event, ui ) {
					var item = ui.item.data( "ui-selectmenu-item" );

					// Prevent inital focus from firing and check if its a newly focused item
					if ( that.focusIndex != null && item.index !== that.focusIndex ) {
						that._trigger( "focus", event, { item: item } );
						if ( !that.isOpen ) {
							that._select( item, event );
						}
					}
					that.focusIndex = item.index;

					that.button.attr( "aria-activedescendant",
						that.menuItems.eq( item.index ).attr( "id" ) );
				}
			} )
			.menu( "instance" );


		// Don't close the menu on mouseleave
		this.menuInstance._off( this.menu, "mouseleave" );

		// Cancel the menu's collapseAll on document click
		this.menuInstance._closeOnDocumentClick = function() {
			return false;
		};

		// Selects often contain empty items, but never contain dividers
		this.menuInstance._isDivider = function() {
			return false;
		};

        this.menuInstance._keydown = function(){
            //Poistetaan jquery ui:n menuun liittyvät näppäimistötapahtumat, jotta tekstikentässä voisi kirjoittaa rauhassa
        };


	},

     }
);
