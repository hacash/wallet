const util_http = koappx.util('http');

const cnf = koappx.config();

exports.query = async function(path, params) {
    return await util_http.json(cnf.fullnode_api_url+"/query/"+path, params||{})
}




