// https://weblogs.asp.net/dixin/use-fiddler-with-node-js

const url = require("url");
const http = require("http");
const env = process.env;
const proxy = {
    protocol: "http:",
    hostname: "127.0.0.1",
    port: 8888,
};

const proxyRequests = () => {
    env.http_proxy = env.https_proxy = url.format(proxy);
    env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // 0 make warning
};

const unproxyRequests = () => {
    env.http_proxy = env.https_proxy = "";
    env.NODE_TLS_REJECT_UNAUTHORIZED = "";
};

const setProxy = options => {
    if (typeof options === "string") { // options can be URL string.
        options = url.parse(options);
    }

    if (!options.host && !options.hostname) {
        throw new Error("host or hostname must have value.");
    }

    options.path = url.format(options);
    options.headers = options.headers || {};
    options.headers.Host = options.host || url.format({
        hostname: options.hostname,
        port: options.port
    });

    options.protocol = proxy.protocol;
    options.hostname = proxy.hostname;
    options.port = proxy.port;
    options.href = null;
    options.host = null;
    return options;
};

const setProxy2 = options => {
    if (typeof options === "string") { // options can be URL string.
        options = url.parse(options);
    }

    if (!options.host && !options.hostname) {
        throw new Error("host or hostname must have value.");
    }
    options.path = url.format(options) + options.path;
    options.headers = options.headers || {};
    options.headers.Host = options.host || url.format({
        hostname: options.hostname,
        port: options.port
    });

    options.protocol = proxy.protocol;
    options.hostname = proxy.hostname;
    options.port = proxy.port;
    options.href = null;
    options.host = null;
    return options;
};

const request = (options, callback) => http.request(setProxy(options), callback);
const request2 = (options, callback) => http.request(setProxy2(options), callback);
const get = (options, callback) => http.get(setProxy(options), callback);
const get2 = (options, callback) => http.get(setProxy2(options), callback);

module.exports = {
    proxy,
    proxyRequests,
    unproxyRequests,
    setProxy,
    setProxy2,
    request,
    request2,
    get,
    get2,
};
