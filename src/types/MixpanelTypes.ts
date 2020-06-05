export interface MixpanelTypes {
    user_id: number;
    user_kyc_status: string;
    account_id: number;
    account_currency: string;
    email: string;
    'first name': string;
    'last name': string;
    account_type: string;
    accounts_all: string[];
    reg_date: string;
    'total_account_p&l': number;
    total_account_deposits_number: number;
    total_account_withdraw_number: number;
    total_account_trades_number: number;
}

export interface MixpanelMarketOrder {
    label: string;
    value: number;
    multiplier: string;
    trend: 'buy' | 'sell';
    sltp: 'yes' | 'no';
    event_ref: "markets" | 'instrument page';
}