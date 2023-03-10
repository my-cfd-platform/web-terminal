const Page = {
  DASHBOARD: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  LP_LOGIN: '/lpLogin/:token',
  EMAIL_CONFIRMATION: '/confirm/:id',
  FORGOT_PASSWORD: '/reset-password',
  RESET_PASSWORD: '/recovery/:token',
  PERSONAL_DATA: '/personal-data',
  PHONE_VERIFICATION: '/phone-verification',
  PROOF_OF_IDENTITY: '/proof-of-identity',
  ACCOUNT_PROFILE: '/account-profile',
  ACCOUNT_DEPOSIT: '/account-deposit',
  ACCOUNT_WITHDRAW: '/account-withdraw',
  ACCOUNT_BALANCE_HISTORY: '/account-balance-history',
  ACCOUNT_SETTINGS: '/account-settings',
  ACCOUNT_SEQURITY: '/account-security',
  ACCOUNT_TYPE_INFO: '/account-types',
  ACCOUNT_HISTORY_QUOTES: '/account-history-quotes',
  ACCOUNT_MT5: '/account-mt5',
  PAYMENTS: '/payments/:status',
  DEPOSIT_POPUP: '/#deposit',
  ONBOARDING: '/onboarding',
  BONUS_FAQ: '/bonus-faq',

  ABOUT_US: 'https://www.monfex.com/why-us',
  FAQ: '#',
  SUPPORT: 'https://www.monfex.com/contact-us',

  TERMS_OF_SERVICE: 'https://monfex.com/terms-of-service',
  PRIVACY_POLICY: 'https://www.monfex.com/privacy-policy',

  NOT_FOUND: '/404',
};

Object.freeze(Page);

export default Page;
