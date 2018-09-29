module.exports = function (current, pages, queryString, baseURL) {
    let pageStr = "";
    let searchParam = "";
    let num = -1;
    if (queryString && queryString.length > 0) {
        searchParam = '&' + queryString;
    }
    if (pages && pages > 1) {
        pageStr = '<nav aria-label="Search results pages"><ul class="pagination justify-content-center">';
        if (current != 1) {
            pageStr += '<li class="page-item"><a class="page-link" href="/' + baseURL + '">First</a></li>';
            num = Number(current) - 1;
            pageStr += '<li class="page-item"><a class="page-link" href="/' + baseURL + '?page=' + num + searchParam + '">«</a></li>';
        }

        let i = (Number(current) > 5 ? Number(current) - 4 : 1);
        if (i != 1) {
            pageStr += '<li class="page-item disabled"><a class="page-link">...</a></li>';
        }

        for (; i <= (Number(current) + 4) && i <= pages; i++) {
            if (i === current) {
                pageStr += '<li class="page-item active"><a class="page-link">' + i + '</a></li>';
            } else {
                pageStr += '<li class="page-item"><a class="page-link" href="/' + baseURL + '?page=' + i + searchParam + '">' + i + '</a></li>';
            }
            if (i === Number(current) + 4 && i < pages) {
                pageStr += '<li class="page-item disabled"><a class="page-link">...</a></li>';
            }
        }

        if (current != pages) {
            num = Number(current) + 1;
            pageStr += '<li class="page-item"><a class="page-link" href="/' + baseURL + '?page=' + num + searchParam + '">»</a></li>';
            pageStr += '<li class="page-item"><a class="page-link" href="/' + baseURL + '?page=' + pages + searchParam + '">Last</a></li>';
        }
        pageStr += '</ul></nav>';
    } else {
        pageStr = '<nav class="pagination justify-content-center" aria-label="Search results pages">End of Results</nav>';
    }
    return pageStr;
};