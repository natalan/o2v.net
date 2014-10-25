/*!
 * jQuery Custom Facebook Fan Widget Plugin
 * Examples and documentation at: http://o2v.net/facebookWidget
 * Copyright (c) 2010 Andrei Zharau
 * Version: 1.10 (07-JUNE-2010)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.4.2 or later
 * Usage: $("#element").fWidget({showTotalNumber: true, fans: 9, objectID: '38453090414, likeLink:'a.facebookPlus'})
 */

jQuery.fn.facebookWidget = function(opts){
    return this.each(function() {
        defaults = {
            showTotalNumber : true, //display or not the total number of all fans
            fans : 40, //total number of fans to show in the widget
            api : "63cad7511106c1311ad6ac333805732f1", //Facebook API key (it should work even without API key, but Facebook can block you in future)
            objectID : "38453090414", //Object ID
            likeLink : "a.facebookPlus" //Selector of a Like link
        }
        var options = jQuery.extend(defaults, opts);
        jQuery("<div/>", {
            "class" : "number-friends",
            html : "loading..."
        }).appendTo(jQuery(this));
        jQuery("<ul/>", {
            id : "fans"
        }).appendTo(jQuery(this));
        var jsonURL = "http://query.yahooapis.com/v1/public/yql?q=SELECT%20*%20FROM%20html%20WHERE%20url%3D%22http%3A%2F%2Fwww.connect.facebook.com%2Fwidgets%2Ffan.php%3Fapi_key%3D"+ options.api +"%26id%3D"+ options.objectID +"%26connections%3D"+ options.fans +"%22%20AND%20%20xpath%20IN%20(%20%22%2F%2Fdiv%5B%40class%3D'connections_grid%20clearfix'%5D%2Fdiv%22%2C%22%2F%2Fspan%5B%40class%3D'total'%5D%22%2C%22%2F%2Fspan%5B%40class%3D'name'%5D%22)&format=json&callback=?";
        //grab YQL stream
        jQuery.ajax({
            url: jsonURL,
            dataType: 'json',
            timeout: 30000,
            error: function(xhr, status, e) {
                jQuery("div.number-friends").text(e)
            },
            success: function (data) {
                if (jQuery("div.number-friends").length && options.showTotalNumber)
                    jQuery("div.number-friends").css({
                        "text-align":"left"
                    }).text(data.query.results.span[0].content + " people like " + data.query.results.span[1].content);
                else jQuery("div.number-friends").hide();
                if (data.query.results == null) {
                    jQuery("div.number-friends").text("An error has occured fetching the feed")
                    return;
                }
                jQuery.each(data.query.results.div, function(i,fan){
                    if (i>0) { //skip first empty box
                        jQuery("<li/>", {
                            id: "fan"+i,
                            css: {
                                height : 50,
                                width : 50
                            }
                        })
                        .append(jQuery("<a/>", {
                            href:  (fan.a.href) ? fan.a.href : "",
                            title: fan.div.p
                        }).append(jQuery("<img/>", {
                            src: fan.a.img.src,
                            alt: fan.div.p
                        })))
                        .appendTo('ul#fans');
                    }
                });
                // Code To enable click on Like button
                jQuery("<div/>", {
                    id: "icontainer",
                    css: {
                        'overflow':'hidden',
                        'width':10,
                        'height':12,
                        'position':'absolute',
                        'filter':'alpha(opacity=0)',
                        'opacity':0.0,
                        '-khtml-opacity':0.0
                    }
                }).append(jQuery("<iframe/>", {
                    src: "https://www.facebook.com/plugins/likebox.php?id="+ options.objectID +"&amp;width=500&amp;connections=0&amp;stream=false&amp;header=true&amp;height=62",
                    "scrolling":"no",
                    "frameborder":"0",
                    "allowTransparency":"true",
                    "class":"likee",
                    'name':'likee',
                    css: {
                        'border':'none',
                        'overflow':'hidden',
                        width: 500,
                        height:70,
                        'margin':'-35px 0 0 -80px'
                    }
                }
                )
                ).appendTo('body');

                if (jQuery(options.likeLink).length) {
                    jQuery(options.likeLink).bind("mousemove", function(e){
                        jQuery('#icontainer').css({
                            top:  e.pageY-5,
                            left: e.pageX-5
                        })
                    })
                }

            }
        });
    });
}