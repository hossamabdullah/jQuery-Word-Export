if (typeof jQuery !== "undefined" && typeof saveAs !== "undefined") {
    (function($) {
        $.fn.wordExport = function(fileName) {
            fileName = typeof fileName !== 'undefined' ? fileName : "jQuery-Word-Export";
            var static = {
                mhtml: {
                    top: "Mime-Version: 1.0\nContent-Base: " + location.href + "\nContent-Type: Multipart/related; boundary=\"NEXT.ITEM-BOUNDARY\";type=\"text/html\"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset=\"utf-8\"\nContent-Location: " + location.href + "\n\n<!DOCTYPE html>\n<html>\n_html_</html>",
                    head: "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n<style>\n_styles_\n</style>\n</head>\n",
                    body: "<body>_body_</body>"
                }
            };
            var options = {
                maxWidth: 624
            };
            // Clone selected element before manipulating it
            var markup = $(this).clone();
		
	    modifyClonedData(markup);
		
            // Remove hidden elements from the output
            markup.each(function() {
                var self = $(this);
                if (self.is(':hidden'))
                    self.remove();
            });

            // Embed all images using Data URLs
            var images = Array();
            var img = markup.find('img');
            for (var i = 0; i < img.length; i++) {
                // Calculate dimensions of output image
                var w = Math.min(img[i].width, options.maxWidth);
                var h = img[i].height * (w / img[i].width);
                // Create canvas for converting image to data URL
                var canvas = document.createElement("CANVAS");
                canvas.width = w;
                canvas.height = h;
                // Draw image to canvas
                var context = canvas.getContext('2d');
                context.drawImage(img[i], 0, 0, w, h);
                // Get data URL encoding of image
                var uri = canvas.toDataURL("image/png");
                $(img[i]).attr("src", img[i].src);
                img[i].width = w;
                img[i].height = h;
                // Save encoded image to array
                images[i] = {
                    type: uri.substring(uri.indexOf(":") + 1, uri.indexOf(";")),
                    encoding: uri.substring(uri.indexOf(";") + 1, uri.indexOf(",")),
                    location: $(img[i]).attr("src"),
                    data: uri.substring(uri.indexOf(",") + 1)
                };
            }

            // Prepare bottom of mhtml file with image data
            var mhtmlBottom = "\n";
            for (var i = 0; i < images.length; i++) {
                mhtmlBottom += "--NEXT.ITEM-BOUNDARY\n";
                mhtmlBottom += "Content-Location: " + images[i].location + "\n";
                mhtmlBottom += "Content-Type: " + images[i].type + "\n";
                mhtmlBottom += "Content-Transfer-Encoding: " + images[i].encoding + "\n\n";
                mhtmlBottom += images[i].data + "\n\n";
            }
            mhtmlBottom += "--NEXT.ITEM-BOUNDARY--";

            //load css from included stylesheet
	    $.each(markup.find("*"),function(index,value){
                var style = css($(this));
                $(this).css(style);
            });	
		
            // Aggregate parts of the file together
            var fileContent = static.mhtml.top.replace("_html_", static.mhtml.head.replace("_styles_", styles) + static.mhtml.body.replace("_body_", markup.html())) + mhtmlBottom;

            // Create a Blob with the file contents
            var blob = new Blob([fileContent], {
                type: "application/msword;charset=utf-8"
            });
            saveAs(blob, fileName + ".doc");
        };
    })(jQuery);
} else {
    if (typeof jQuery === "undefined") {
        console.error("jQuery Word Export: missing dependency (jQuery)");
    }
    if (typeof saveAs === "undefined") {
        console.error("jQuery Word Export: missing dependency (FileSaver.js)");
    }
}

function modifyClonedData(markup){
    markup.find("input[type=email]").attr("type","text");
    markup.find("input[type=date]").attr("type","text");
    markup.find("input[type=url]").attr("type","text");
    markup.find("input[type=datetime]").attr("type","text");
    markup.find("input[type=datetime-local]").attr("type","text");
    markup.find("input[type=month]").attr("type","text");
    markup.find("input[type=number]").attr("type","text");
    markup.find("input[type=search]").attr("type","text");
    markup.find("input[type=time]").attr("type","text");
    markup.find("input[type=week]").attr("type","text");
    markup.find("input[type=button]").attr("type","submit");
}

jQuery(document).ready(function($) {
    $("input[type=text], textarea,input[type=password]").keyup(function() { 
        var x =$(this).val();
		alert(x);
        $(this).attr("value",x); 
            
    }); 
$('input[type="checkbox"]').change( function () {

      if($(this).prop('checked')){
		   $(this).attr('checked', true);
     }else{
		  		   $(this).attr("checked",false); 

     }
	});	
	$('input[type="radio"]').change( function () {
 
       if($(this).prop('checked')){
		   $(this).attr('checked', true);
     }else{
		  		   $(this).attr("checked",false); 

     }
	});

$('input[type="file"]').on('change', function (event, files, label) {
    var file_name = this.value.replace(/\\/g, '/').replace(/.*\//, '')
	$(this).after('<span id="file"></span>');
	 $('#file').css('visibility', 'hidden');
    $('#file').text(file_name);
});	
});
    

function css(a) {
    var sheets = document.styleSheets, o = {};
    for (var i in sheets) {
        var rules = sheets[i].rules || sheets[i].cssRules;
        for (var r in rules) {
            if (a.is(rules[r].selectorText)) {
                o = $.extend(o, css2json(rules[r].style), css2json(a.attr('style')));
            }
        }
    }
    return o;
}


function css2json(css) {
    var s = {};
    if (!css) return s;
    if (css instanceof CSSStyleDeclaration) {
        for (var i in css) {
            if ((css[i]).toLowerCase) {
                s[(css[i]).toLowerCase()] = (css[css[i]]);
            }
        }
    } else if (typeof css == "string") {
        css = css.split("; ");
        for (var i in css) {
            var l = css[i].split(": ");
            s[l[0].toLowerCase()] = (l[1]);
        }
    }
    return s;
}
