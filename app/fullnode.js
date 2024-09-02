
const KoaProxy = require('koa-proxy');

const app = koappx.app();
const cnf = koappx.config();


app.use(KoaProxy({
    host: cnf.fullnode_api_url,
    match: /^\/fullnode\//,
    map: function(path) {
        return path.substr(9)
    }
}));






// exports.fullnode_api_proxy = function(app) {

// }


