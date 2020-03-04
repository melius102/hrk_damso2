const request = require('request');
// const fiddler = require('./fiddler');
// fiddler.proxyRequests(); // for requests module
const pKeys = require('./private_keys');

const client_id = pKeys.client_id;
const client_secret = pKeys.client_secret;
const langkey = {
    kr: 'ko',
    en: 'en',
    jp: 'ja',
    cn: 'zh-CN',
    hi: 'en',
    ar: 'en'
};

/////////
// papago
function translation_naver(src_lang, target_lang, query, cb) {
    const api_url = 'https://openapi.naver.com/v1/papago/n2mt';
    var options = {
        url: api_url,
        form: {
            'source': langkey[src_lang],
            'target': langkey[target_lang],
            'text': query
        },
        headers: {
            'X-Naver-Client-Id': client_id,
            'X-Naver-Client-Secret': client_secret
        }
    };
    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            data = JSON.parse(body).message.result;
            console.log("naver: ", data);
            cb(data.translatedText);
        } else {
            console.log('error = ' + response.statusCode);
        }
    });
}


let naver_api = {
    translation_naver
};

module.exports = naver_api;