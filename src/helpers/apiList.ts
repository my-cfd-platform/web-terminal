const API_LIST = {
  POSITIONS: {
    OPEN: '/api/v1/Positions/Open',
    CLOSE: '/api/v1/Positions/Close',
    UPDATE_SL_TP: '/api/v1/Positions/UpdateTpSl',
  },
  ACCOUNTS: {
    GET_ACCOUNTS: '/api/v1/Accounts',
    GET_ACCOUNT_BY_ID: '/api/v1/Accounts/ById',
    GET_HEADERS: '/api/v1/Headers',
    AUTHENTICATE: '/api/v1/Accounts/Authenticate',
  },
  TRADER: {
    AUTHENTICATE: '/api/v1/Trader/Authenticate',
    REGISTER: '/api/v1/Trader/Register',
  },
  PRICE_HISTORY: {
    CANDLES: '/api/v1/PriceHistory/Candles',
  },
  KEY_VALUE: {
    GET: '/api/v1/KeyValue',
    POST: '/api/v1/KeyValue',
  },
  PENDING_ORDERS: {
    ADD: '/api/v1/PendingOrders/Add',
    REMOVE: '/api/v1/PendingOrders/Remove',
  },
  REPORTS: {
    POSITIONS_HISTORY: '/api/v1/Reports/PositionsHistory',
    BALANCE_HISTORY: '/api/v1/Reports/BalanceHistory',
  },
  INSTRUMENTS: {
    FAVOURITES: '/api/v1/Instruments/Favorites'
  },
  DEPOSIT: {
    CREATE: '/deposit/Create',
    GET_CRYPTO_WALLET: '/deposit/GetCryptoWallet'
  }
};

Object.freeze(API_LIST);

export default API_LIST;
