const request = require("request");
const cheerio = require("cheerio");
const fs = require('fs');
// const outfile = fs.createWriteStream("test.html");

// function gethtml(url) {
//     const https = require('https');
//     https.get(url, function(res) {
//         res.pipe(outfile);
//         res.on('end', () => {
//             outfile.close();
//             console.log('ok');
//         });
//     });
// }

// gethtml("https://translate.google.com");

//////////////
// translation
function translation_google(src_lang, target_lang, query, cb) {
    query = encodeURI(query);
    request.get({
        url: `https://translate.google.com`
    }, function (err, res, body) {
        let $ = cheerio.load(body);
        console.log($('.area_flex').eq(1).html());
        $('div').each(function (idx) {
            var text = $(this).text();
            var html = $(this).html();
            console.log(text, ':', html);
        })
        let target = 'test';
        cb(target);
    });
}

// translation_google(null, null, "hello", function (data) {
//     console.log('------------------------------');
//     console.log(data);
// });

let google_api = {
    translation_google
};

module.exports = google_api;