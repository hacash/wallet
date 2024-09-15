/*
* index
*/
// global.koappx = require('koappx')
global.koappx = require('../koappx')




/*
* run
*/
koappx.run(function(){

    // fullnode api proxy
    require('./app/fullnode.js')

})



/*
* genesis_init
* koappx.genesis_init()
*/

