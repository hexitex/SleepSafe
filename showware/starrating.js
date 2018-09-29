module.exports = function(obj, nos, displayOnly) { // obj assume to have attr of rating
    let stars = [];
    if (Array.isArray(obj)) { // check if this is being used on the index page, if so do for each site in the list, use css to make font based icons smaller and use the 'i' forEach(item,i) as the index to the icons array 
        obj.forEach(function(obj, inx) {
            stars.push(starMaker(obj, nos, displayOnly, inx.toString()));
        });
        return stars;
    }
    else { // this is the show/edit/add page so only do for one
        return (starMaker(obj, nos, displayOnly, '0'));
    }
}

function starMaker(obj, nos, displayOnly, id) {
    //  console.log(obj.name)
    let icons = '<span class="forTheStars">';
    let src = '';
    if (!obj || !obj.rating) { //new
        icons = '<span class="forTheStars py-2 px-2" mod="' + id + '">';
        for (let st = 0; st < nos; st++) {
            icons += '<i class="star-me fas fa-star mid-' + id + '" sn="' + st + '" mid="' + id + '"></i>'; // assign onclick in page with .star-me class selector
        }
        return icons + '</span>';
    }
    if (obj.rating && displayOnly) { // show page or index no need to deal with obj._id
        let last = '';

        if (obj.rating && obj.rating.toString().endsWith('.5')) // dispaly it if it is there but need to get back to this
        {
            last = '<i class="fas star-me star-me-on fa-star-half"></i>'
        }

        for (let i = 0; i < Math.floor(obj.rating); i++) {
            icons += '<i class="fas star-me star-me-on fa-star"></i>'
        }
        icons += last;
        for (let i = 0; i < nos - Math.ceil(obj.rating); i++) {
            icons += '<i class="fas star-me fa-star"></i>';
        }
    }
    else if (obj.rating && !displayOnly) { // edit
        let last = '';
        icons = '<span class="forTheStars py-2 px-2" mod="' + id + '">';

        for (let st = 0; st < nos; st++) {
            if (st <=obj.rating - 1) {
                icons += '<i class="star-me star-me-on fas fa-star mid-' + id + '" mid="' + id + '" sn="' + st + '" ></i>';
            }
            else {
                icons += '<i class="star-me fas fa-star mid-' + id + '" mid="' + id + '" sn="' + st + '"></i>';
            }
        }
    }

    return icons + '</span>';
}
