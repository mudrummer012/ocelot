var https = require('https'),
    url = require('url'),
    config = require('config');

// todo: delegate to auth backend for url composition

function doPost(query, client, secret) {
    return new Promise(function (resolve, reject) {
        var basicAuth, authServer;

        basicAuth = 'basic ' + new Buffer(client + ':' + secret, 'utf8').toString('base64');
        authServer = url.parse(config.get('authentication.ping.host'));

        var options = {
            host: authServer.host,
            path: '/as/token.oauth2?' + query,
            method: 'POST',
            headers: {
                Authorization: basicAuth
            }
        };

        var httpsReq = https.request(options, function (postres) {
            var data = '';
            postres.setEncoding('utf8');

            postres.on('data', function (chunk) {
                data = data + chunk;
            });

            postres.on('end', function () {
                try {
                    var result = JSON.parse(data);
                    if (!result.error) {
                        resolve(result);
                    }
                    else {
                        reject(result.error);
                    }
                }
                catch (err) {
                    reject('could not parse JSON response: ' + data);
                }
            });
        });
        httpsReq.on('error', function (error) {
            reject(error);
        });
        httpsReq.end();
    });
}

exports.post = doPost;

exports.post = function (query, route) {
    var client = route['client-id'];
    var secret = route['client-secret'];

    return doPost(query, client, secret);
};

exports.postAs = function (query, client, secret) {
    return doPost(query, client, secret);
};