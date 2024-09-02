/* index.js */


var $wlt = document.getElementById('wlt')
, $wltits = $wlt.getElementsByClassName('item')
, wltitslen = $wltits.length
, wltitsidx = 0;

function showOneWLT() {
    $wltits[wltitsidx].classList.add('show')
    wltitsidx++
    if(wltitsidx < wltitslen){
        setTimeout(showOneWLT, 180)
    }
}
showOneWLT()


var $scr = document.getElementById('scr')
setTimeout(function(){
    $wlt.classList.remove('anim')
}, 1800)
setTimeout(function(){
    $scr.classList.remove('hide')
}, 2200)



/****************************************** */



;VueCreateAppCommon('balance', {
    addrs: "",
    // addrs: "1MzNY1oA3kfgYi75zquj3SRUPYztzXHzK9,18Yt6UbnDKaXaBaMPnBdEHomRYVKwcGgyH",
    balances: [],
    totalamt: "",
}, {
    toThousands,
    getBalance: function(){
        var that = this
        , lss = that.addrs.replace(/[\s,，]+/ig, ",").replace(/^,|,$/ig, "")
        if( ! lss){
            return "Please enter wallet address."
        }
        if( lss.split(",")>=20 ){
            return "No more than 20 wallet addresses."
        }
        // alert(lss)
        apiget("/fullnode/query/balance", {
            address: lss,
        }, function(data){
            let list = data.list;
            // console.log(list)
            var adrs = lss.split(",");
            for(var i in adrs){
                list[i].address = adrs[i]
            }
            that.balances = list // 显示
        }, function(err){
            // console.log(err)
            alert("Query failed: " + err.msg)
            that.balances = []
        })
    }
});


;VueCreateAppCommon('txstatus', {
    txhash: "",
    txhash_show: "",
    result: null,
    // txhash_show: "40e43b578ceddcaa82362878c06a18997256e1b59fba1c3566fbcd2bc7fb544d",
    // result: {status: "txpool"},
    // result: {err: "txpool"},

}, {
    statusTx() {
        var that = this
        that.txhash = that.txhash.replace(/[\s\n]+/ig, "")
        if(!that.txhash){
            return alert("Please enter transaction hash.")
        }
        apiget("/fullnode/query/transaction", {
            hash: that.txhash,
        }, function(data){
            console.log(data)
            that.txhash_show = data.hash+""
            that.txhash = ""
            that.result = data
            that.result.stat = 'notfind'; 
            if(that.result.block){
                that.result.stat='confirm'
            }else if(that.result.pending){
                that.result.stat='pending'
            }
        }, function(errmsg){
            // console.log(errmsg)
            that.result = {
                err: errmsg
            }
        })
    },
})

;VueCreateAppCommon('sendtx', {
    txbody: "",
    result: null,
    // result: {ret:0, txhash: "40e43b578ceddcaa82362878c06a18997256e1b59fba1c3566fbcd2bc7fb544d"}
    // result: {ret:1, err: "Balance not enaght"}
}, {
    sendTx (){
        var that = this
        that.txbody = that.txbody.replace(/[\s\n]+/ig, "")
        if(!that.txbody){
            return alert("Please enter transaction body.")
        }
        let bodydata = hexToBytes(that.txbody);
        apipost("/fullnode/submit/transaction", bodydata, function(data){
            that.txbody = ""
            that.result = data // 提交成功
        }, function(errmsg){
            that.result = {
                err: errmsg,
            }
        })
        }
});



