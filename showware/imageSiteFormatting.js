const isImage = require('is-image');

module.exports = function(sites) {
    return (siteImgs(sites));
}

function siteImgs(site) {
    let imagesHTML = '';
    if (site.moreImages.length > 0) {

        imagesHTML += '<div id="myCarousel" class="carousel slide" data-ride="carousel" data-interval="false"><!-- Indicators --><ol class="carousel-indicators">' +
            '<li data-target="#myCarousel" data-slide-to="0"></li>';

        site.moreImages.forEach(function(img, i) {
            imagesHTML += '<li data-target="#myCarousel" data-slide-to="' + parseInt(i + 1) + '"></li>"';
        });

        imagesHTML += '</ol><!-- Wrapper for slides --><div class="carousel-inner"><div class="item active">';
        if (isImage(site.image)) {
            imagesHTML += '<img src="' + site.image + '" class="responsive-image">';
        }
        else if (site.image.toLowerCase().endsWith('pdf')) {
            imagesHTML += '<embed src="' + site.image + '" alt="pdf" pluginspage="http://www.adobe.com/products/acrobat/readstep2.html" class="responsive-image">';
        }
        else {
            imagesHTML += '<video class="responsive-image" controls><source src="' + site.image + '" type="video/mp4">Your browser does not support the video tag.</video>';
        }
        imagesHTML += '</div>';
        site.moreImages.forEach(function(img) {
            if (isImage(img)) {
                imagesHTML += '<div class="item"><img src="' + img + '" class="responsive-image"></div>'
            }
            else if (img.toLowerCase().endsWith('pdf')) {
                imagesHTML += '<div class="item"><embed src="' + img + '" alt="pdf" pluginspage="http://www.adobe.com/products/acrobat/readstep2.html" class="responsive-image"></div>';
            }
            else {
                imagesHTML += '<div class="item"><video class="responsive-image" controls><source src="' + img + '" type="video/mp4">Your browser does not support the video tag.</video></div>';
            }
        });
        imagesHTML += '</div><!-- Left and right controls --><a class="left carousel-control" href="#myCarousel" data-slide="prev"><span class="glyphicon glyphicon-chevron-left"></span><span class="sr-only">Previous</span>';
        imagesHTML += '</a><a class="right carousel-control" href="#myCarousel" data-slide="next"><span class="glyphicon glyphicon-chevron-right"></span><span class="sr-only">Next</span></a></div>';
        if (isImage(site.image)) {
            imagesHTML += '<img class="image-responsive" src="' + site.image.trim().length === 0 ? "/assets/img/noimage.jpg" : site.image + '">';
        }
        else if (site.image.toLowerCase().endsWith('pdf')) {
            imagesHTML += '<embed src="' + site.image + '" alt="pdf" pluginspage="http://www.adobe.com/products/acrobat/readstep2.html" class="responsive-image">';
        }
        else {
            imagesHTML += '<video class="responsive-image" controls><source src="' + site.image + '" type="video/mp4">Your browser does not support the video tag.</video>';
        }

    }
}