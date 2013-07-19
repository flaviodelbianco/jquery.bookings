/**
 * Bookings v 0.0.1
 * http://www.flaviodelbianco.com
 *
 * Use jquery.bookings.css for basic styling.
 * Tooltips requires jQuery UI Tooltips.
 */

(function($)
{
    var PLUGIN_NAME = "bookings";
    var DEFAULT_OPTIONS =
    {
        cellWidth: 50,
        strip: {
            height: 20,
            top: 1,
            left: 1,
            right: 1,
            bottom: 1
        },
        initialMonth: 'auto', // 'auto' for the current month or numbers from 1 (January) to 12 (December)
        initialYear: 'auto', // 'auto' for the current month or a full year number (es: 2000)
        data: [],
        monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
        dayNames: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
        prevButton: {
            content: '&laquo; Prev',
            classes: '',
        },
        nextButton: {
            content: 'Next &raquo;',
            classes: '',
        },
        labelTextColor: '#ffffff',
        labelBackground: '#004080',
        activeTooltip: false,
        onInit: function () {},
        beforeDataLoad: function () {},
        onLoad: function (bookingsVisible, data) {},
        border: 1
    };
    var pluginInstanceIdCount = 0;

    var I = function(/*HTMLElement*/ element)
    {
        return new Internal(element);
    };

    var Internal = function(/*HTMLElement*/ element)
    {
        this.$elem = $(element);
        this.elem = element;
        this.data = this.getData();

        // Shorthand accessors to data entries:
        this.id = this.data.id;
        this.opt = this.data.opt;
    };

    /**
     * Initialises the plugin.
     */
    Internal.prototype.init = function(/*Object*/ customOptions)
    {
        var $el = this.$elem;
        var data = this.getData();

        if (!data.initialised)
        {
            data.initialised = true;
            c = data.opt = $.extend(DEFAULT_OPTIONS, customOptions);

            if (typeof c.initialMonth == 'number')
                var month = c.initialMonth;
            else
                var month = this.getRealMonth(new Date().getMonth());

            if (typeof c.initialYear == 'number')
                var year = c.initialYear;
            else
                var year = new Date().getFullYear();

            var content = ''+
            '<div class="jb-main" style="display: none">'+
                '<div class="jb-topbar">'+
                '</div>'+
                '<ul class="jb-labelsColumn">'+
                '</ul>'+
                '<div class="jb-container">'+
                    '<div class="jb-grid">'+
                        '<ul class="jb-head">'+
                        '</ul>'+
                        '<ul class="jb-body">'+
                        '</ul>'+
                    '</div>'+
                '</div>'+
            '</div>';

            $el.html(content);
            $el.bookings('changeMonth', month, year);
            c.onInit();
        }
    };

    /**
     * Build calendar
     */
    Internal.prototype.buildCalendar = function (month, year, data)
    {
        var $this = this;
        var $el = this.$elem;
        var c = this.opt;
        var strip = $.extend({
            height: 20,
            top: 1,
            left: 1,
            right: 1,
            bottom: 0
        }, c.strip);
        var numOfDays = new Date(year, month+1, 0).getDate();

        // building the topbar
        var topBarContent = ''+
        '<div class="jb-navigator">'+
            '<a href="javascript:;" class="jb-btnPrev '+c.prevButton.classes+'">'+c.prevButton.content+'</a>'+
            '<span class="jb-currentMonthLabel">'+c.monthNames[month]+' '+year+'</span>'+
            '<a href="javascript:;" class="jb-btnNext '+c.prevButton.classes+'">'+c.nextButton.content+'</a>'+
        '</div>';

        $el.find('.jb-topbar').html(topBarContent);

        // set events on click prev and next buttons
        $el.find('.jb-btnPrev').click(function () {
            if (month == 0)
                $el.bookings('changeMonth', 12, year-1);
            else
                $el.bookings('changeMonth', $this.getRealMonth(month-1), year);
        });
        $el.find('.jb-btnNext').click(function () {
            if (month == 11)
                $el.bookings('changeMonth', 1, year+1);
            else
                $el.bookings('changeMonth', $this.getRealMonth(month+1), year);
        });

        // building days row
        var daysContent = '';
        for (i = 1; i <= numOfDays; i++)
        {
            var now = new Date(),
                date = new Date(year, month, i),
                dayOfTheWeek = date.getDay(),
                holiday = (dayOfTheWeek == 0 || dayOfTheWeek == 6) ? 'jb-holiday': '';
                today = (i == now.getUTCDate() && month == now.getUTCMonth() && year == now.getUTCFullYear()) ? 'jb-today': '';
            daysContent += '<li class="jb-cell '+holiday+' '+today+'" style="width: '+c.cellWidth+'px"><span class="jb-dayLabel">'+c.dayNames[dayOfTheWeek]+'<br/>'+i+'</span></li>';
        }
        $el.find('.jb-head').html(daysContent).addClass('clearfix').width(numOfDays*(c.cellWidth+c.border));

        // building grid
        var labelsContent = '',
            bodyContent = '',
            bookingsVisible = [];
        $.each(data, function (k_section, section) {
            var itemsContent = ''
                bodyItemsContent = '';
            $.each(section.items, function (k_item, item) {
                var bView = 0,
                    bookingsContent = '';
                    cellContent = '';

                $.each(item.bookings, function (k_booking, booking) {
                    var bStartDate = new Date(booking.start);
                    var bEndDate = new Date(booking.end);
                    if ((bStartDate.getUTCMonth() == month && bStartDate.getUTCFullYear() == year) || (bEndDate.getUTCMonth() == month && bEndDate.getUTCFullYear() == year))
                    {
                        var bStartDay = (bStartDate.getUTCMonth() == month) ? bStartDate.getUTCDate() : 1;
                            bEndDay = (bEndDate.getUTCMonth() == month) ? bEndDate.getUTCDate() : numOfDays;
                            startOnSameMonth = (bStartDate.getUTCMonth() == month) ? true : false;
                            endOnSameMonth = (bEndDate.getUTCMonth() == month) ? true : false;
                            sLeft = (startOnSameMonth) ? strip.left : 0;
                            sRight = (endOnSameMonth) ? strip.right : 0;
                            bLeft = (bStartDay-1) * c.cellWidth + ((bStartDay-1)*c.border) + sLeft;
                            bWidth = (bEndDay-bStartDay+1) * c.cellWidth + (((bEndDay-bStartDay+1)-1)*c.border) - sLeft - sRight;
                            bTop = (bView * (strip.height + strip.top + strip.bottom)) + strip.top;
                            bBackground = (booking.background) ? booking.background : c.labelBackground;
                            bColor = (booking.textColor) ? booking.textColor : c.labelTextColor;
                            bLabel = (booking.label) ? booking.label : '&nbsp;';
                            leftRadious = '';
                            rightRadious = '';
                            tooltip = (booking.tooltip) ? '<div class="jb-tooltip">'+booking.tooltip+'</div>' : '';
                            bookingId = (booking.id) ? 'id="'+booking.id+'"' : '';

                        if (!endOnSameMonth)
                            rightRadious =  'border-top-right-radius: 0; -moz-border-radius-topright: 0; -webkit-border-top-right-radius: 0; border-bottom-right-radius: 0; -moz-border-radius-bottomright: 0; -webkit-border-bottom-right-radius: 0;';

                        if (!startOnSameMonth)
                            leftRadious =  'border-top-left-radius: 0; -moz-border-radius-topleft: 0; -webkit-border-top-left-radius: 0; border-bottom-left-radius: 0; -moz-border-radius-bottomleft: 0; -webkit-border-bottom-left-radius: 0;';

                        bookingsContent += '<div class="jb-booking" '+bookingId+' style="width: '+bWidth+'px; height: '+strip.height+'px;left: '+bLeft+'px; top: '+bTop+'px; background:'+bBackground+'; color: '+bColor+'; '+leftRadious+' '+rightRadious+'"><span>'+bLabel+'</span>'+tooltip+'</div>';
                        bView++;
                        bookingsVisible.push(booking);
                    }
                });
                var rowHeight = (bView) ? bView * (strip.height + strip.top + strip.bottom) : strip.height;

                itemsContent += '<li class="jb-row jb-item'+k_section+k_item+'"><div class="jb-rowLabel">'+item.label+'</div></li>';

                for (i = 1; i <= numOfDays; i++)
                {
                    var now = new Date(),
                        date = new Date(year, month, i),
                        dayOfTheWeek = date.getDay(),
                        holiday = (dayOfTheWeek == 0 || dayOfTheWeek == 6) ? 'jb-holiday': '',
                        today = (i == now.getUTCDate() && month == now.getUTCMonth() && year == now.getUTCFullYear()) ? 'jb-today': '';
                    cellContent += '<li class="jb-cell '+holiday+' '+today+'" style="width: '+c.cellWidth+'px; height: '+rowHeight+'px;">&nbsp;</li>';
                }
                bodyItemsContent += ''+
                '<li class="jb-row jb-item'+k_section+k_item+'" style="height: '+rowHeight+'px">'+
                    '<ul class="clearfix">'+
                        cellContent+
                    '</ul>'+
                    bookingsContent+
                '</li>';
            });
            labelsContent += ''+
            '<li class="jb-section">'+
                '<div class="jb-sectionLabel jb-sec'+k_section+'">'+section.label+'</div>'+
                '<ul>'+
                    itemsContent+
                '</ul>'+
            '</li>';
            bodyContent += ''+
            '<li class="jb-section" style="width: '+(numOfDays*(c.cellWidth+c.border))+'px">'+
                '<div class="jb-sectionLabel jb-sec'+k_section+'">&nbsp;</div>'+
                '<ul>'+
                    bodyItemsContent+
                '</ul>'+
            '</li>';
        });

        $el.find('.jb-main').show();
        $el.find('.jb-labelsColumn').html(labelsContent).css('margin-top', ($el.find('.jb-head').height()+c.border)+'px');
        $el.find('.jb-body').html(bodyContent);

        this.resetTableAlign(data);

        if (c.activeTooltip)
        {
            if(jQuery().tooltip)
            {
                var tooltips = $el.tooltip({
                    items: ".jb-booking",
                    content: function() {
                        return $(this).find('.jb-tooltip').html();
                    },
                    position: {
                        my: "center bottom-20",
                        at: "center top",
                        using: function( position, feedback ) {
                          $( this ).css( position );
                          $( "<div>" )
                            .addClass( "arrow" )
                            .addClass( feedback.horizontal )
                            .appendTo( this );
                        }
                    }
                });
                tooltips.tooltip( "open" );
            }
            else
                $.error("We couldn't find the tooltip plugin");
        }
        if (typeof c.onLoad == 'function')
            c.onLoad(bookingsVisible, data);
    }

    /**
     * Reset table alignaments
     */
    Internal.prototype.resetTableAlign = function (data)
    {
        $.each(data, function (k_section, section) {
            $('.jb-body .jb-sec'+k_section).height($('.jb-labelsColumn .jb-sec'+k_section).height());
            $.each(section.items, function (k_item, item) {
                var hl = $('.jb-labelsColumn .jb-item'+k_section+k_item).height();
                var hb = $('.jb-body .jb-item'+k_section+k_item).height();
                if (hl >= hb)
                {
                    $('.jb-body .jb-item'+k_section+k_item).height(hl);
                    $('.jb-body .jb-item'+k_section+k_item+' li').height(hl);
                }
                else
                {
                    $('.jb-labelsColumn .jb-item'+k_section+k_item).height(hb);
                }
            });
        });
    }

    /**
     * Return the human number of month
     */
    Internal.prototype.getRealMonth = function(/* month from 0-11 */ month)
    {
        return month+1;
    };

    /**
     * Returns the data for relevant for this plugin
     * while also setting the ID for this plugin instance
     * if this is a new instance.
     */
    Internal.prototype.getData = function()
    {
        if (!this.$elem.data(PLUGIN_NAME))
        {
            this.$elem.data(PLUGIN_NAME, {
                id : pluginInstanceIdCount++,
                initialised : false
            });
        }

        return this.$elem.data(PLUGIN_NAME);
    };

    /**
     * Returns the event namespace for this widget.
     * The returned namespace is unique for this widget
     * since it could bind listeners to other elements
     * on the page or the window.
     */
    Internal.prototype.getEventNs = function(/*boolean*/ includeDot)
    {
        return (includeDot !== false ? "." : "") + PLUGIN_NAME + "_" + this.id;
    };

    /**
     * Removes all event listeners, data and
     * HTML elements automatically created.
     */
    Internal.prototype.destroy = function()
    {
        this.$elem.unbind(this.getEventNs());
        this.$elem.removeData(PLUGIN_NAME);

        // TODO: Unbind listeners attached to other elements of the page and window.
    };

    var publicMethods =
    {
        init: function(/*Object*/ customOptions)
        {
            return this.each(function()
            {
                I(this).init(customOptions);
            });
        },

        destroy: function()
        {
            return this.each(function()
            {
                I(this).destroy();
            });
        },

        changeMonth: function(month, year)
        {
            return this.each(function(){
                $this = this;
                c = I($this).opt;
                if (typeof c.beforeDataLoad == 'function')
                    c.beforeDataLoad();
                if (typeof c.data == 'string')
                {
                    $.ajax({
                        dataType: "json",
                        url: c.data,
                        data: { m: month, y: year },
                        success: function (data) {
                            I($this).buildCalendar(month-1, year, data);
                        }
                    });
                }
                else if (typeof c.data == 'object')
                {
                    I($this).buildCalendar(month-1, year, c.data);
                }
                else
                {
                    $.error('The \'data\' parameter has an incorrect value');
                }
            });
        }
    };

    $.fn[PLUGIN_NAME] = function(/*String|Object*/ methodOrOptions)
    {
        if (!methodOrOptions || typeof methodOrOptions == "object")
        {
            return publicMethods.init.call(this, methodOrOptions);
        }
        else if (publicMethods[methodOrOptions])
        {
            var args = Array.prototype.slice.call(arguments, 1);

            return publicMethods[methodOrOptions].apply(this, args);
        }
        else
        {
            $.error("Method '" + methodOrOptions + "' doesn't exist for " + PLUGIN_NAME + " plugin");
        }
        return this;
    };
})(jQuery);