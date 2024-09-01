
const fullnode = koappx.model('fullnode');


module.exports = async function(cnf, ctx){

    let q = ctx.query || {};

    // query from fullnode
    try {
        let res = await fullnode.query('transaction/desc', {
            hash: q.txhash,
        });
        ctx.apiData( res )
    }catch(e) {
        ctx.apiError(e)
    }
    
}
    