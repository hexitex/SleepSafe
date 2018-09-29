//repetative segments of html, only the tooltips and icon class should be needed, uses icon stacking to stack two icons over one another set the opacity for the icons in the css
const stackStart = "<span class='fa-stack fa-lg' data-toggle='tooltip' data-placement='top' title='";
const singleStart = "<span data-toggle='tooltip' data-placement='top' title='";
const singleEnd = " bigger trans-text-blue'></i></span> ";
const stackUnknownEnd = " fa-stack-1x trans-text-blue'></i><i class='far fa-question-circle fa-stack-2x trans-text-orange'></i></span> ";
const stackNoEnd = " fa-stack-1x trans-text-blue'></i><i class='far fa-times-circle fa-stack-2x trans-text-red'></i></span> ";

module.exports = function (sites) {
    let iconset = [];
    if (Array.isArray(sites)) { // check if this is being used on the index page, if so do for each site in the list, use css to make font based icons smaller and use the 'i' forEach(item,i) as the index to the icons array 
        sites.forEach(function (site) {
            iconset.push(siteIcons(site));
        });
        return iconset;
    } else { // this is the show page so only do for one
        return (siteIcons(sites));
    }
}

function siteIcons(site) {
    let icons = "";

    if (site.water === '' || site.water === 'unknown') {
        icons += stackStart + "Unknown if there is drinking water here'><i class='fas fa-tint" + stackUnknownEnd;
    } else if (site.water === 'true') {
        icons += singleStart + "There is drinking water here'><i class='fas fa-tint" + singleEnd;
    } else {
        icons += stackStart + "There is no drinking water here'><i class='fas fa-tint" + stackNoEnd;
    }

    if (site.shelter === '' || site.shelter === 'unknown') {
        icons += stackStart + "Unknown if there is shelter here'><i class='fas fa-store" + stackUnknownEnd;
    } else if (site.shelter === 'true') {
        icons += singleStart + "There is shelter here'><i class='fas fa-store" + singleEnd;
    } else {
        icons += stackStart + "There is no shelter here'><i class='fas fa-store" + stackNoEnd;
    }

    if (site.warm === '' || site.warm === 'unknown') {
        icons = icons + stackStart + "Unknown if there is warmth here'><i class='fab fa-gripfire" + stackUnknownEnd;
    } else if (site.warm === 'true') {
        icons += singleStart + "There is warmth here'><i class='fab fa-gripfire" + singleEnd;
    } else {
        icons += stackStart + "There is no warmth here'><i class='fab fa-gripfire" + stackNoEnd;
    }

    if (site.charging === '' || site.charging === 'unknown') {
        icons += stackStart + "Unknown if there is power here'><i class='fas fa-battery-three-quarters" + stackUnknownEnd;
    } else if (site.charging === 'true') {
        icons += singleStart + "There is power here'><i class='fas fa-battery-three-quarters" + singleEnd;
    } else {
        icons += stackStart + "There is no power here'><i class='fas fa-battery-three-quarters" + stackNoEnd;
    }

    if (site.food === '' || site.food === 'unknown') {
        icons += stackStart + "Unknown if there is food here'><i class='fas fa-utensils" + stackUnknownEnd;
    } else if (site.food === 'donated') {
        icons += singleStart + "There is donated food here'><i class='fas fa-utensils" + singleEnd;
    }
    // no point in doing end for this one
    else if (site.food === 'purchase') {
        icons += stackStart + "There is food for purchase here'><i class='fas fa-utensils fa-stack-1x trans-text-blue'></i><i class='far fa-money-bill-alt fa-stack-2x trans-text-green'></i></span>&nbsp;&nbsp;&nbsp;&nbsp;";
    } else {
        icons += stackStart + "There is no food here'><i class='fas fa-utensils" + stackNoEnd;
    }

    if (site.wash === '' || site.wash === 'unknown') {
        icons += stackStart + "Unknown if there is washing facilities here'><i class='fas fa-bath" + stackUnknownEnd;
    } else if (site.wash === 'true') {
        icons += singleStart + "There is washing facilities here'><i class='fas fa-bath" + singleEnd;
    } else {
        icons += stackStart + "There is no washing facilities here'><i class='fas fa-bath" + stackNoEnd;
    }

    if (site.dog === '' || site.dog === 'unknown') {
        icons += stackStart + "Unknown if dogs are allowed here'><i class='fas fa-paw" + stackUnknownEnd;
    } else if (site.dog === 'true') {
        icons += singleStart + "Dogs are allowed here'><i class='fas fa-paw" + singleEnd;
    } else {
        icons += stackStart + "No dogs are allowed here'><i class='fas fa-paw" + stackNoEnd;
    }

    return icons;
}