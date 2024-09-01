module.exports = {

    // page view
    '/': 'VIEW:index',

    '/create': 'VIEW:create',
    '/web': 'VIEW:webwallet',
    '/desktop': 'VIEW:desktop',

    ///////////////////////////

    '/api/get_balance': 'api/get_balance',
    '/api/tx_status': 'api/tx_status',
    '/api/estimate_fee': 'api/estimate_fee',
    '/api/raise_fee': 'api/raise_fee',
    'POST:/api/send_tx': 'api/send_tx',
    'POST:/api/create_trs': 'api/create_trs',
    'POST:/api/check_tx': 'api/check_tx',
    
}
    