import {
  LOCAL_STORAGE_TOKEN_KEY,
  LOCAL_STORAGE_REFRESH_TOKEN_KEY,
  LOCAL_STORAGE_LANGUAGE,
} from './../constants/global';
import {
  UserAuthenticate,
  UserRegistration,
  LpLoginParams,
} from '../types/UserInfo';
import { HubConnection } from '@aspnet/signalr';
import { AccountModelWebSocketDTO } from '../types/AccountsTypes';
import { action, observable, computed } from 'mobx';
import API from '../helpers/API';
import { OperationApiResponseCodes } from '../enums/OperationApiResponseCodes';
import initConnection from '../services/websocketService';
import Topics from '../constants/websocketTopics';
import Axios from 'axios';
import RequestHeaders from '../constants/headers';
import KeysInApi from '../constants/keysInApi';
import { RootStore } from './RootStore';
import Fields from '../constants/fields';
import { ResponseFromWebsocket } from '../types/ResponseFromWebsocket';
import { PersonalDataKYCEnum } from '../enums/PersonalDataKYCEnum';
import mixpanel from 'mixpanel-browser';
import mixpanelEvents from '../constants/mixpanelEvents';
import injectInerceptors from '../http/interceptors';
import { InstrumentModelWSDTO } from '../types/InstrumentsTypes';
import { AskBidEnum } from '../enums/AskBid';
import { ServerError } from '../types/ServerErrorType';
import apiResponseCodeMessages from '../constants/apiResponseCodeMessages';
import { InitModel } from '../types/InitAppTypes';
import { CountriesEnum } from '../enums/CountriesEnum';
import mixapanelProps from '../constants/mixpanelProps';

interface MainAppStoreProps {
  token: string;
  refreshToken: string;
  isInterceptorsInjected: boolean;
  isAuthorized: boolean;
  signIn: (credentials: UserAuthenticate) => void;
  signUp: (credentials: UserRegistration) => Promise<unknown>;
  activeSession?: HubConnection;
  isLoading: boolean;
  isInitLoading: boolean;
  activeAccount?: AccountModelWebSocketDTO;
  accounts: AccountModelWebSocketDTO[];
  setActiveAccount: (acc: AccountModelWebSocketDTO) => void;
  tradingUrl: string;
  profileStatus: PersonalDataKYCEnum;
  isDemoRealPopup: boolean;
  signalRReconnectTimeOut: string;
  initModel: InitModel;
  lang: CountriesEnum;
  activeAccountId: string;
}

// TODO: think about application initialization
// describe step by step init, loaders, async behaviour in app
// think about loader flags - global, local

export class MainAppStore implements MainAppStoreProps {
  @observable initModel: InitModel = {
    aboutUrl: '',
    androidAppLink: '',
    brandCopyrights: '',
    brandName: '',
    brandProperty: '',
    faqUrl: '',
    withdrawFaqUrl: '',
    favicon: '',
    gaAsAccount: '',
    iosAppLink: '',
    logo: '',
    policyUrl: '',
    supportUrl: '',
    termsUrl: '',
    tradingUrl: '',
    authUrl: '',
    mixpanelToken: '582507549d28c813188211a0d15ec940',
    recaptchaToken: '',
  };
  @observable isLoading = true;
  @observable isInitLoading = true;
  @observable isDemoRealPopup = false;
  @observable isAuthorized = false;
  @observable activeSession?: HubConnection;
  @observable activeAccount?: AccountModelWebSocketDTO;
  @observable accounts: AccountModelWebSocketDTO[] = [];
  @observable profileStatus: PersonalDataKYCEnum =
    PersonalDataKYCEnum.NotVerified;
  @observable tradingUrl = '';
  @observable isInterceptorsInjected = false;
  @observable profilePhone = '';
  @observable lang = CountriesEnum.EN;
  token = '';
  refreshToken = '';
  rootStore: RootStore;
  signalRReconnectTimeOut = '';
  connectTimeOut = '';
  @observable socketError = false;
  @observable activeAccountId: string = '';
  @observable signUpFlag: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || '';
    this.refreshToken =
      localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY) || '';
    Axios.defaults.headers[RequestHeaders.AUTHORIZATION] = this.token;
    // @ts-ignore
    this.lang =
      localStorage.getItem(LOCAL_STORAGE_LANGUAGE) || CountriesEnum.EN;
  }

  initApp = async () => {
    try {
      const initModel = await API.getInitModel();
      this.initModel = initModel;
    } catch (error) {
      this.rootStore.badRequestPopupStore.openModal();
      this.rootStore.badRequestPopupStore.setMessage(error);
    }
  };

  handleInitConnection = async (token = this.token) => {
    const wsConnectSub =
      this.tradingUrl[this.tradingUrl.length - 1] === '/'
        ? 'signalr'
        : `/signalr`;
    const connectionString = IS_LIVE ? this.tradingUrl + wsConnectSub : WS_HOST;
    const connection = initConnection(connectionString);

    const connectToWebocket = async () => {
      try {
        await connection.start();
        try {
          await connection.send(Topics.INIT, token);
          this.isAuthorized = true;
          this.activeSession = connection;
        } catch (error) {
          this.isAuthorized = false;
          this.isInitLoading = false;
          this.isAuthorized = false;
        }
      } catch (error) {
        this.isInitLoading = false;
        setTimeout(
          connectToWebocket,
          this.signalRReconnectTimeOut ? +this.signalRReconnectTimeOut : 10000
        );
      }
    };
    connectToWebocket();

    connection.on(Topics.UNAUTHORIZED, () => {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      this.isInitLoading = false;
      this.isLoading = false;
      this.isAuthorized = false;
    });

    connection.on(
      Topics.ACCOUNTS,
      (response: ResponseFromWebsocket<AccountModelWebSocketDTO[]>) => {
        this.accounts = response.data;
        this.getActiveAccount();

        mixpanel.people.set({
          [mixapanelProps.ACCOUNTS]: response.data.map((item) => item.id),
          [mixapanelProps.FUNDED_TRADER]: `${response.data.some(
            (item) => item.isLive && item.balance > 0
          )}`,
        });
      }
    );

    connection.on(
      Topics.UPDATE_ACCOUNT,
      (response: ResponseFromWebsocket<AccountModelWebSocketDTO>) => {
        this.activeAccount = response.data;
        this.accounts = this.accounts.map((account) =>
          account.id === response.data.id ? response.data : account
        );
      }
    );

    connection.on(
      Topics.INSTRUMENTS,
      (response: ResponseFromWebsocket<InstrumentModelWSDTO[]>) => {
        if (
          this.activeAccount &&
          response.accountId === this.activeAccount.id
        ) {
          response.data.forEach((item) => {
            this.rootStore.quotesStore.setQuote({
              ask: {
                c: item.ask || 0,
                h: 0,
                l: 0,
                o: 0,
              },
              bid: {
                c: item.bid || 0,
                h: 0,
                l: 0,
                o: 0,
              },
              dir: AskBidEnum.Buy,
              dt: Date.now(),
              id: item.id,
            });
          });
          this.rootStore.instrumentsStore.setInstruments(response.data);
        }
      }
    );

    connection.on(
      Topics.SERVER_ERROR,
      (response: ResponseFromWebsocket<ServerError>) => {
        this.isInitLoading = false;
        this.isLoading = false;
        this.rootStore.badRequestPopupStore.openModal();
        this.rootStore.badRequestPopupStore.setMessage(response.data.reason);
      }
    );

    connection.onclose((error) => {
      this.rootStore.badRequestPopupStore.openModal();
      this.rootStore.badRequestPopupStore.setMessage(
        error?.message ||
          apiResponseCodeMessages[OperationApiResponseCodes.TechnicalError]
      );
      this.socketError = true;
      console.log('websocket error: ', error);
      console.log('=====/=====');
    });
  };

  fetchTradingUrl = async (token = this.token) => {
    try {
      const response = await API.getTradingUrl(this.initModel.authUrl);
      this.setTradingUrl(response.tradingUrl);
      if (!this.isInterceptorsInjected) {
        injectInerceptors(response.tradingUrl, this);
      }
      this.handleInitConnection(token);
    } catch (error) {
      this.setTradingUrl('/');
      this.isLoading = false;
      this.isInitLoading = false;
    }
  };

  postRefreshToken = async () => {
    const refreshToken = `${this.refreshToken}`;
    this.refreshToken = '';
    try {
      const result = await API.refreshToken(
        { refreshToken },
        this.initModel.authUrl
      );
      if (result.refreshToken) {
        this.setRefreshToken(result.refreshToken);
        this.setTokenHandler(result.token);
      }
    } catch (error) {
      this.setRefreshToken('');
      this.setTokenHandler('');
    }
  };

  getActiveAccount = async () => {
    try {
      const activeAccountId = await API.getKeyValue(
        KeysInApi.ACTIVE_ACCOUNT_ID
      );
      const activeAccount = this.accounts.find(
        (item) => item.id === activeAccountId
      );
      if (activeAccount) {
        this.activeSession?.send(Topics.SET_ACTIVE_ACCOUNT, {
          [Fields.ACCOUNT_ID]: activeAccount.id,
        });
        this.activeAccount = activeAccount;
        this.activeAccountId = activeAccount.id;
      } else {
        this.isDemoRealPopup = true;
      }
      this.isInitLoading = false;
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      this.rootStore.badRequestPopupStore.setMessage(error);
      this.rootStore.badRequestPopupStore.openModal();
    }
  };

  @action
  setSignUpFlag = (value: boolean) => {
    this.signUpFlag = value;
  };

  @action
  setActiveAccount = (account: AccountModelWebSocketDTO) => {
    this.activeAccount = account;
    this.activeAccountId = account.id;
    // TODO: think how remove crutch
    this.rootStore.historyStore.positionsHistoryReport.positionsHistory = [];
    API.setKeyValue({
      key: KeysInApi.ACTIVE_ACCOUNT_ID,
      value: account.id,
    });
  };

  @action
  signIn = async (credentials: UserAuthenticate) => {
    const response = await API.authenticate(
      credentials,
      this.initModel.authUrl
    );
    if (response.result === OperationApiResponseCodes.Ok) {
      this.isAuthorized = true;
      this.signalRReconnectTimeOut = response.data.reconnectTimeOut;
      this.connectTimeOut = response.data.connectionTimeOut;
      this.setTokenHandler(response.data.token);
      this.fetchTradingUrl(response.data.token);
      this.setRefreshToken(response.data.refreshToken);
      mixpanel.track(mixpanelEvents.LOGIN, {
        [mixapanelProps.BRAND_NAME]: this.initModel.brandName.toLowerCase(),
      });
    }

    if (
      response.result === OperationApiResponseCodes.InvalidUserNameOrPassword
    ) {
      this.isAuthorized = false;
    }

    return response.result;
  };

  @action
  signInLpLogin = async (params: LpLoginParams) => {
    const response = await API.postLpLoginToken(params, this.initModel.authUrl);

    if (response.result === OperationApiResponseCodes.Ok) {
      this.isAuthorized = true;
      this.signalRReconnectTimeOut = response.data.reconnectTimeOut;
      this.setTokenHandler(response.data.token);
      this.fetchTradingUrl(response.data.token);
      this.setRefreshToken(response.data.refreshToken);
      mixpanel.track(mixpanelEvents.LOGIN);
    }

    if (
      response.result === OperationApiResponseCodes.InvalidUserNameOrPassword
    ) {
      this.isAuthorized = false;
    }

    return response.result;
  };

  @action
  signUp = async (credentials: UserRegistration) => {
    const response = await API.signUpNewTrader(
      credentials,
      this.initModel.authUrl
    );
    if (response.result === OperationApiResponseCodes.Ok) {
      this.signalRReconnectTimeOut = response.data.reconnectTimeOut;
      this.isAuthorized = true;
      this.setTokenHandler(response.data.token);
      this.setRefreshToken(response.data.refreshToken);
      this.fetchTradingUrl(response.data.token);
    }

    if (
      response.result === OperationApiResponseCodes.InvalidUserNameOrPassword
    ) {
      this.isAuthorized = false;
    }
    return response.result;
  };

  @action
  signOut = () => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
    this.token = '';
    this.refreshToken = '';
    this.isAuthorized = false;
    this.rootStore.quotesStore.activePositions = [];
    this.rootStore.quotesStore.pendingOrders = [];
    delete Axios.defaults.headers[RequestHeaders.AUTHORIZATION];
    this.activeAccount = undefined;
    this.activeAccountId = '';
    mixpanel.reset();
  };

  @action
  setTradingUrl = (tradingUrl: string) => {
    this.tradingUrl = tradingUrl;
  };

  setTokenHandler = (token: string) => {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    Axios.defaults.headers[RequestHeaders.AUTHORIZATION] = token;
    this.token = token;
  };

  setRefreshToken = (refreshToken: string) => {
    localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, refreshToken);
    this.refreshToken = refreshToken;
  };

  @action
  setLanguage = (newLang: CountriesEnum) => {
    localStorage.setItem(LOCAL_STORAGE_LANGUAGE, newLang);
    this.lang = newLang;
  };

  @computed
  get sortedAccounts() {
    return this.accounts.reduce(
      (acc, prev) =>
        prev.id === this.activeAccount?.id ? [prev, ...acc] : [...acc, prev],
      [] as AccountModelWebSocketDTO[]
    );
  }
}
