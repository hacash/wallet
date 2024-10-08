var chrome_tip = "Your browser version is too low and private key generation is not secure. Please use the latest version of Chrome browser";


// test
// document.getElementById("init").className = "ok";

// getElementsByClassName one
function $id(a) {
    return document.getElementById(a)
}
function $cno(a, n) {
    return a.getElementsByClassName(n)[0]
}


function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2){
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return Uint8Array.from(bytes);
}

function getUrlQuery(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return null;
 }


// Chain ID
var chain_id = getUrlQuery('chain_id') || '0'
, chain_name = decodeURIComponent(getUrlQuery('chain_name') || '');
console.log("chain_id =", chain_id)

// chain_id = chain_id + ''


var $cid = $id('cid')
if(chain_id > 0){
    $cno($cid, 'cidtip').innerText = "Attention: Transactions generated by this wallet are specifically customized for test or fork chain with Chain ID = "+chain_id+" ("+chain_name+")"
    $cid.style.display = "block"
    document.body.style.background = "#0d232d"
}


///////////////////////

var $load = $id('load')
, $load_box = $cno($load, 'box')
, $load_loading = $cno($load, "loading")
, $load_progress = $cno($load, "progress")
, $load_bar = $cno($load_progress, "slider")
, $load_pgt = $cno($load, "pgt")
, $load_tips = $cno($load, "tips")
;

var $wlt = $id('wlt')

;

setTimeout(function(){
    $load_box.classList.remove('hide')
}, 5)

// loading progress
var is_progress_started = false
var hacash_sdk_loading_progress = function (percent) {
    if(!is_progress_started){
        $load_loading.style.display = 'none'
        $load_progress.style.display = 'block' 
        $load_tips.innerText = 'Loading wallet program, please wait...'
        is_progress_started = true 
    }
    var peri = parseInt(percent)
    $load_bar.style.width = percent + "%";
    $load_pgt.innerText = peri + "%";
    if(peri == 70){
        $load_tips.innerText = ' Loading will be completed soon...'
    }
    if(peri == 95){
        $load_tips.innerText = 'Loading completed'
    }
    if(peri >= 100){
        loadFinishShowWallet()
    }
    // console.log(percent)
}

function loadFinishShowWallet(){
    $load_pgt.innerText = "Completed";
    $load_tips.innerText = 'Initializing program...'
    $load_progress.classList.add('hide')
    setTimeout(function(){
        $load_box.classList.add('hide')
        setTimeout(function(){
            $load.style.display = 'none'
            $wlt.style.display = 'block'
            $wlt.classList.remove('hide')
        }, 200)
    }, 400) 
}



// check WebAssembly
var WebAssemblyIsOK = false
if(!WebAssembly || !WebAssembly.Instance || !WebAssembly.Module) {
    $init.innerHTML = "<div style='padding: 40px 20px; background: brown; color: azure; font-size: 18px; font-weight: bold;'>NOT support WebAssembly! Your browser version is too old, please upgrade your browser to the latest version.</div>"
}else{
    WebAssemblyIsOK = true
    function buildWasm(hacash_sdk_wasm_code) {
        // console.log(hacash_sdk_wasm_code)
        wasm_bindgen(hacash_sdk_wasm_code).then(function(){
            hacash_wallet_main(wasm_bindgen);
        });
    }
    if(window.hacash_sdk_wasm_code_callback) {
        
        hacash_sdk_wasm_code_callback(buildWasm, hacash_sdk_loading_progress)

    }else if(window.parse_hacash_sdk_wasm_code) {
        
        var hacash_sdk_wasm_code = parse_hacash_sdk_wasm_code()
        // console.log(hacash_sdk_wasm_code)
        buildWasm(hacash_sdk_wasm_code)
        loadFinishShowWallet()

    }else if(window.hacash_sdk_wasm_code) {

        // alert('window.hacash_sdk_wasm_code')
        // console.log(hacash_sdk_wasm_code)
        buildWasm(hacash_sdk_wasm_code)
        loadFinishShowWallet()
    
    }
}


/** API:
 * create_account_by
 * hac_transfer
 * sat_transfer
 * hacd_transfer
 */


// start
function hacash_wallet_main(API){
    if(!WebAssemblyIsOK){
        return
    }

    // test
    var acc = JSON.parse(API.create_account_by("123456"))
    console.log(acc, acc.address)

    // init
    init_create_account(API)
    init_hac_transfer(API)
    init_sat_transfer(API)
    init_hacd_transfer(API)

    // loading ok
    $load.classList.add("ok");

}

// hacd transfer
function init_hacd_transfer(API) {
    var $acc = document.getElementById("hacdtrs")
    , $ipt1 = $cno($acc, "ipt1")
    , $ipt2 = $cno($acc, "ipt2")
    , $ipt3 = $cno($acc, "ipt3")
    , $ipt4 = $cno($acc, "ipt4")
    , $ipt5 = $cno($acc, "ipt5")
    , $btn1 = $cno($acc, "btn1")
    , $btn2 = $cno($acc, "btn2")
    , $btn3 = $cno($acc, "btn3")
    , $offline = $cno($acc, "offline")
    , $success = $cno($acc, "success")
    , $box1 = $cno($acc, "box1")
    , $box2 = $cno($acc, "box2")
    , confirmTip = ""
    , txhash = ""
    , txbody = ""
    ;

    // 非在线模式
    if(window.location.host != "wallet.hacash.org") {
        $btn3.style.display = "none" // 隐藏提交交易按钮
        $offline.style.display = "block"
    }

    // submit tx
    $btn3.onclick = function() {
        if($btn3.classList.contains("ban")){
            return
        }
        if( !confirm(confirmTip + "\n\nOnce a transaction is committed to the blockchain, is it irreversible, Are you sure to submit?") ){
           return 
        }
        // 提交
        $btn3.classList.add("ban")
        // post
        // axios.post("/api/send_tx", {
        //     txbody: txbody,
        // }).then(function(r){
        axios.post("/fullnode/submit/transaction", hexToBytes(txbody)).then(function(r){
            $btn3.classList.remove("ban")
            // console.log(r.data)
            if(r.data.ret == 0){
                $btn3.style.display = "none"
                $success.style.display = "block"
                $cno($success, "hx").innerText = txhash
            }else{
                alert(r.data.err)
            }
        }).catch(function(e){
            $btn3.classList.remove("ban")
            alert(e.toString())
        })
    }

    // set tx body
    function genTx(tx) {
        var a1 = tx.paymenta_ddress
        , a2 = tx.collection_address
        $cno($box2, "pay").innerText = a1
        $cno($box2, "get").innerText = a2
        $cno($box2, "num").innerText = tx.diamond_count
        $cno($box2, "amt").innerText = tx.diamonds
        $cno($box2, "fee").innerText = tx.fee
        $cno($box2, "txhx").innerText = tx.tx_hash
        $cno($box2, "txbody").innerText = tx.tx_body
        $box2.style.display = "block";
        $box1.style.display = "none";
        confirmTip = "Payment account " + a1 + " transfer HAC " + tx.amount + " to address " + a2 + " (fee: "+tx.fee+")"
        txhash = tx.tx_hash
        txbody = tx.tx_body
    }

    // back
    $btn2.onclick = function(){
        $box1.style.display = "block";
        $box2.style.display = "none";
        $ipt1.value = "" // del password
    }

    // create tx
    $btn1.onclick = function(){
        var v1 = $ipt1.value
        , v2 = $ipt2.value
        , v3 = $ipt3.value
        , v4 = $ipt4.value
        , v5 = $ipt5.value
        ;
        if(v1.length >= 6 && v2.length>=32 && v2.length<=34 && v3.length>=6 && v4.length>0 && v5.length>0){}else{
            return alert("please fill the form correctly.")
        }
        // 创建交易
        // console.log(chain_id, v1, v4, v2, v3, v5)
        var ret = API.hacd_transfer(chain_id, v1, v4, v2, v3, v5, "0")
        ret = JSON.parse(ret);
        // console.log(ret)
        if(ret.error) {
            return alert(ret.error)
        }
        if(ret.diamonds) {
            genTx(ret)
        }
    }

}


// hac transfer
function init_hac_transfer(API) {
    var $acc = document.getElementById("hactrs")
    , $ipt1 = $cno($acc, "ipt1")
    , $ipt2 = $cno($acc, "ipt2")
    , $ipt3 = $cno($acc, "ipt3")
    , $ipt4 = $cno($acc, "ipt4")
    , $btn1 = $cno($acc, "btn1")
    , $btn2 = $cno($acc, "btn2")
    , $btn3 = $cno($acc, "btn3")
    , $offline = $cno($acc, "offline")
    , $success = $cno($acc, "success")
    , $box1 = $cno($acc, "box1")
    , $box2 = $cno($acc, "box2")
    , confirmTip = ""
    , txhash = ""
    , txbody = ""
    ;

    // 非在线模式
    if(window.location.host != "wallet.hacash.org") {
        $btn3.style.display = "none" // 隐藏提交交易按钮
        $offline.style.display = "block"
    }

    // submit tx
    $btn3.onclick = function() {
        if($btn3.classList.contains("ban")){
            return
        }
        if( !confirm(confirmTip + "\n\nOnce a transaction is committed to the blockchain, is it irreversible, Are you sure to submit?") ){
           return 
        }
        // 提交
        $btn3.classList.add("ban")
        // post
        axios.post("/fullnode/submit/transaction", hexToBytes(txbody)).then(function(r){
            $btn3.classList.remove("ban")
            // console.log(r.data)
            if(r.data.ret == 0){
                $btn3.style.display = "none"
                $success.style.display = "block"
                $cno($success, "hx").innerText = txhash
            }else{
                alert(r.data.err)
            }
        }).catch(function(e){
            $btn3.classList.remove("ban")
            alert(e.toString())
        })
    }

    // set tx body
    function genTx(tx) {
        console.log(tx)
        var a1 = tx.payment_address
        , a2 = tx.collection_address
        $cno($box2, "pay").innerText = a1
        $cno($box2, "get").innerText = a2
        $cno($box2, "amt").innerText = tx.amount
        $cno($box2, "fee").innerText = tx.fee
        $cno($box2, "txhx").innerText = tx.tx_hash
        $cno($box2, "txbody").innerText = tx.tx_body
        $box2.style.display = "block";
        $box1.style.display = "none";
        confirmTip = "Payment account " + a1 + " transfer HAC " + tx.amount + " to address " + a2 + " (fee: "+tx.fee+")"
        txhash = tx.tx_hash
        txbody = tx.tx_body
    }

    // back
    $btn2.onclick = function(){
        $box1.style.display = "block";
        $box2.style.display = "none";
        $ipt1.value = "" // del password
    }

    // create tx
    $btn1.onclick = function(){
        var v1 = $ipt1.value
        , v2 = $ipt2.value
        , v3 = $ipt3.value
        , v4 = $ipt4.value
        ;
        if(v1.length >= 6 && v2.length>=32 && v2.length<=34 && v3.length>0 && v4.length>0){}else{
            return alert("please fill the form correctly.")
        }
        // 创建交易
        // console.log(chain_id, v1, v2, v3, v4)
        var ret = API.hac_transfer(chain_id, v1, v2, v3, v4, "0")
        ret = JSON.parse(ret);
        // console.log(ret)
        if(ret.error) {
            return alert(ret.error)
        }
        if(ret.amount) {
            genTx(ret)
        }
    }

}

// satoshi transfer
function init_sat_transfer(API) {
    var $acc = document.getElementById("sattrs")
    , $ipt1 = $cno($acc, "ipt1")
    , $ipt2 = $cno($acc, "ipt2")
    , $ipt3 = $cno($acc, "ipt3")
    , $ipt4 = $cno($acc, "ipt4")
    , $ipt5 = $cno($acc, "ipt5")
    , $btn1 = $cno($acc, "btn1")
    , $btn2 = $cno($acc, "btn2")
    , $btn3 = $cno($acc, "btn3")
    , $offline = $cno($acc, "offline")
    , $success = $cno($acc, "success")
    , $box1 = $cno($acc, "box1")
    , $box2 = $cno($acc, "box2")
    , confirmTip = ""
    , txhash = ""
    , txbody = ""
    ;

    // 非在线模式
    if(window.location.host != "wallet.hacash.org") {
        $btn3.style.display = "none" // 隐藏提交交易按钮
        $offline.style.display = "block"
    }

    // submit tx
    $btn3.onclick = function() {
        if($btn3.classList.contains("ban")){
            return
        }
        if( !confirm(confirmTip + "\n\nOnce a transaction is committed to the blockchain, is it irreversible, Are you sure to submit?") ){
           return 
        }
        // 提交
        $btn3.classList.add("ban")
        // post
        axios.post("/fullnode/submit/transaction", hexToBytes(txbody)).then(function(r){
            $btn3.classList.remove("ban")
            // console.log(r.data)
            if(r.data.ret == 0){
                $btn3.style.display = "none"
                $success.style.display = "block"
                $cno($success, "hx").innerText = txhash
            }else{
                alert(r.data.err)
            }
        }).catch(function(e){
            $btn3.classList.remove("ban")
            alert(e.toString())
        })
    }

    // set tx body
    function genTx(tx) {
        var a1 = tx.payment_address
        , a2 = tx.collection_address
        $cno($box2, "pay").innerText = a1
        $cno($box2, "get").innerText = a2
        $cno($box2, "amt").innerText = tx.amount + ' SAT'
        $cno($box2, "fee").innerText = tx.fee
        $cno($box2, "txhx").innerText = tx.tx_hash
        $cno($box2, "txbody").innerText = tx.tx_body
        $box2.style.display = "block";
        $box1.style.display = "none";
        confirmTip = "Payment account " + a1 + " transfer " + tx.amount + " SAT to address " + a2 + " (fee: "+tx.fee+")"
        txhash = tx.tx_hash
        txbody = tx.tx_body
    }

    // back
    $btn2.onclick = function(){
        $box1.style.display = "block";
        $box2.style.display = "none";
        $ipt1.value = "" // del password
    }

    // create tx
    $btn1.onclick = function(){
        var v1 = $ipt1.value
        , v2 = $ipt2.value
        , v3 = $ipt3.value
        , v4 = $ipt4.value
        , v5 = $ipt5.value
        ;
        if(v1.length >= 6 && v2.length>=32 && v2.length<=34 && v3.length>0 && v4.length>=6 && v5.length>0){}else{
            return alert("please fill the form correctly.")
        }
        // 创建交易
        // console.log(chain_id, v1, v4, v2, v3, v5);
        var ret = API.sat_transfer(chain_id, v1, v4, v2, v3, v5, "0");
        ret = JSON.parse(ret);
        // console.log(ret)
        if(ret.error) {
            return alert(ret.error)
        }
        if(ret.amount) {
            genTx(ret)
        }
    }

}


// create account
function init_create_account(API) {

    var crypto = window.crypto || window.webkitCrypto || window.mozCrypto || window.oCrypto || window.msCrypto;

    var get_rand_bytes = function(){
        if(!crypto) {
            return null
        }
        var rdarr = new Uint8Array(256);
        crypto.getRandomValues(rdarr);
        return (new TextDecoder('utf-8')).decode(rdarr)
    }

    var $acc = document.getElementById("acc")
    , $ipt1 = $cno($acc, "ipt1")
    , $btn1 = $cno($acc, "btn1")
    , $btn1_1 = $cno($acc, "btn1_1")
    , $btn2 = $cno($acc, "btn2")
    , $crt1 = $cno($acc, "crt1")
    , $crt2 = $cno($acc, "crt2")

    , crtpswd = document.getElementById('crtpswd')

    crtpswd.onclick = function(){
        if(!confirm("Creating by password will make account security issues (your all assets may be stolen), are you sure you are aware of the risks?")){
            crtpswd.checked = false
            return
        }
        if('I KONW THE RISK' != prompt("Hackers may guess your password through rainbow tables or calculations, the password is the private key itself, there is no second line of defense! Your all assets may be STOLEN, please input 'I KNOW THE RISK' to continue")){
            crtpswd.checked = false
            return
        }
        $crt1.classList.add("show")
        $crt2.classList.add("hide")
    }

    var in1chg = function(){
        var v = $ipt1.value
        , len = v.length
        , hav = v.replace(/[A-Za-z0-9\~\!\@\#\$\%\^\&\*\_\+\-\=\,\.\:\;]+/ig, "")
        if(len >= 6 && len <= 255 && hav == "") {
            $btn2.classList.remove("ban")
        }else{
            $btn2.classList.add("ban")
        }
    }
    $ipt1.onkeyup = in1chg
    $ipt1.onchange = in1chg
    // result
    var result = function(acc, usepass) {
        acc = JSON.parse(acc);
        var $res = $cno($acc, "result")
        , $mark =  $cno($res, "mark")
        , $b1 =    $cno($res, "addr")
        , $b2 =    $cno($res, "pubkey")
        , $b3 =    $cno($res, "prikey")
        ;   
        $mark.innerText = '( by '+ (usepass?('password '+usepass):'randomly') +' )'
        $b1.innerText = acc.address
        $b2.innerText = acc.public_key
        $b3.innerText = acc.private_key
        $res.classList.add("show")
    }
    // random create
    function crtadr(){
        $ipt1.value = ""
        $btn2.classList.add("ban")
        $btn1.classList.add("ban")
        var rdstr = get_rand_bytes()
        // console.log(rdstr)
        if(!rdstr){
            return alert(chrome_tip);
        }
        var acc = API.create_account_by(rdstr)
        result(acc)
        $btn1.classList.remove("ban")
    }
    $btn1.onclick = crtadr
    $btn1_1.onclick = crtadr
    // password create
    $btn2.onclick = function(){
        if($btn2.classList.contains("ban")){
            return
        }
        var v = $ipt1.value
        , rm = v.replace(/[A-Za-z0-9\~\!\@\#\$\%\^\&\*\_\+\-\=\,\.\:\;]+/ig, "")
        if(v.length < 6 || v.length > 255){
            return alert("wrong password length")
        }
        if(rm != "") {
            return alert("unsupported symbol")
        }
        $btn1.classList.add("ban")
        var acc = API.create_account_by(v)
        result(acc, v)
        $btn1.classList.remove("ban")
    }


    // test
    // $btn1.click()



}



/*
// test
var $footer = $id('footer')
, dhost = 'wallet.hacash.org'
, lhost = location.host
;
if(lhost != dhost) {
    $footer.style.display = 'none'
    // replace a
    var as = document.getElementsByTagName('a');
    for(var i=0; i<as.length; i++){
        var a = as[i];
        if(a.innerText == dhost) {
            a.innerText = lhost
            a.href = a.href.replace(dhost, lhost)
            console.log(a)
        }
    }
}
*/





/*
// auto iframe height
if(parent) {
    // alert("parent!")
    var web = parent.document.getElementById("web_wallet_iframe");
    console.log(web)
    console.log(document.body.scrollHeight)
    var upheifunc = function(){
        web.style.height = document.body.scrollHeight; 
    }
    upheifunc()
    setInterval(upheifunc, 1000)
}
*/


/*


function base64ToBuffer(b) {
    const str = window.atob(b);
    const buffer = new Uint8Array(str.length);
    for (let i=0; i < str.length; i++) {
        buffer[i] = str.charCodeAt(i);
    }
    return buffer;
}
var hacash_sdk_wasm_code = base64ToBuffer(hacash_sdk_wasm_code_base64);




function base64ToBuffer(b, progress_call) {
  var str = window.atob(b)
  , strlen = str.length
  , spx = strlen / 100
  , buffer = new Uint8Array(strlen);
  for (var i=0; i < strlen; i++) {
    buffer[i] = str.charCodeAt(i);
    if(i % spx == 0){
      var per = parseFloat(i) / parseFloat(strlen) * 100
      setTimeout(progress_call, 5, per)
    }
  }
  return buffer;
}

window.parse_hacash_sdk_wasm_code = function(progress_call) {
  return base64ToBuffer(hacash_sdk_wasm_code_base64, progress_call);
}






*/


