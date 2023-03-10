import {
  CreatePayRetailersInvoiceParams,
  CreatePayRetailersInvoiceDTO,
  CreateVoltInvoiceDTO,
  CreateVoltInvoiceParams,
  CreatePayopInvoiceParams,
  CreatePayopInvoiceDTO,
} from './../types/DepositTypes';
import { WithdrawalHistoryResponseStatus } from './../enums/WithdrawalHistoryResponseStatus';
import { RefreshToken, RefreshTokenDTO } from './../types/RefreshToken';
import axios, { AxiosRequestConfig } from 'axios';
import {
  OpenPositionResponseDTO,
  ClosePositionModel,
  RemovePendingOrders,
  UpdateSLTP,
  OpenPositionModel,
  OpenPendingOrder,
  UpdateToppingUp,
} from '../types/Positions';
import API_LIST from './apiList';
import {
  AccountModelDTO,
  MTAccountDTO,
  MTCreateAccountDTO,
} from '../types/AccountsTypes';
import {
  UserAuthenticate,
  UserAuthenticateResponse,
  UserRegistration,
  ChangePasswordRespone,
  LpLoginParams,
  RecoveryPasswordParams,
  IWelcomeBonusDTO,
} from '../types/UserInfo';
import {
  CandleDTO,
  HistoryCandlesDTOType,
  HistoryCandlesType,
} from '../types/HistoryTypes';
import {
  PositionsHistoryReportDTO,
  BalanceHistoryDTO,
  GetHistoryParams,
  BalanceHistoryReport,
} from '../types/HistoryReportTypes';
import AUTH_API_LIST from './apiListAuth';
import { ChangePasswordParams } from '../types/TraderTypes';
import {
  PersonalDataResponse,
  PersonalDataParams,
  PersonalDataPostResponse,
} from '../types/PersonalDataTypes';
import { CountriesEnum } from '../enums/CountriesEnum';
import { Country } from '../types/CountriesTypes';
import { DocumentTypeEnum } from '../enums/DocumentTypeEnum';
import { getProcessId } from './getProcessId';
import { AccountTypeEnum } from '../enums/AccountTypeEnum';
import { OperationApiResponseCodes } from '../enums/OperationApiResponseCodes';
import { ServerInfoType } from '../types/ServerInfoTypes';
import {
  GetCryptoWalletDTO,
  GetCryptoWalletParams,
  CreateDepositParams,
  DepositCreateDTO,
  CreateDepositInvoiceParams,
  CreateDepositInvoiceDTO,
  CreateElectronicFundsInvoiceParams,
  CreateElectronicFundsInvoiceDTO,
  CreateDirectaInvoiceParams,
  CreateDirectaInvoiceDTO,
} from '../types/DepositTypes';
import { InitModel } from '../types/InitAppTypes';
import {
  CreateWithdrawalParams,
  WithdrawalHistoryDTO,
  cancelWithdrawalParams,
} from '../types/WithdrawalTypes';
import { ListForEN } from '../constants/listOfLanguages';
import { PendingOrderResponseDTO } from '../types/PendingOrdersTypes';
import { BrandEnum } from '../constants/brandingLinksTranslate';
import { OnBoardingInfo } from '../types/OnBoardingTypes';
import { DebugResponse, DebugTypes } from '../types/DebugTypes';
import requestOptions from '../constants/requestOptions';
import {
  IEducationCoursesDTO,
  IEducationQuestionsDTO,
} from '../types/EducationTypes';

class API {
  private convertParamsToFormData = (params: { [key: string]: any }) => {
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return formData;
  };

  clientRequestOptions: AxiosRequestConfig = {
    timeoutErrorMessage: requestOptions.TIMEOUT,
    data: {
      initBy: requestOptions.CLIENT,
    },
  };
  backgroundRequestOptions: AxiosRequestConfig = {
    timeoutErrorMessage: requestOptions.TIMEOUT,
    data: {
      initBy: requestOptions.BACKGROUND,
    },
  };

  //
  //  Clients Request
  //
  //

  authenticate = async (credentials: UserAuthenticate, authUrl: string) => {
    const response = await axios.post<UserAuthenticateResponse>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.TRADER.AUTHENTICATE}`,
      credentials,
      this.clientRequestOptions
    );
    return response.data;
  };

  signUpNewTrader = async (credentials: UserRegistration, authUrl: string) => {
    const response = await axios.post<UserAuthenticateResponse>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.TRADER.REGISTER}`,
      credentials,
      this.clientRequestOptions
    );
    return response.data;
  };

  openPendingOrder = async (position: OpenPendingOrder) => {
    const formData = this.convertParamsToFormData(position);
    const response = await axios.post<PendingOrderResponseDTO>(
      `${API_STRING}${API_LIST.PENDING_ORDERS.ADD}`,
      formData,
      this.clientRequestOptions
    );
    return response.data;
  };

  removePendingOrder = async (position: RemovePendingOrders) => {
    const formData = this.convertParamsToFormData(position);
    const response = await axios.post<PendingOrderResponseDTO>(
      `${API_STRING}${API_LIST.PENDING_ORDERS.REMOVE}`,
      formData,
      this.clientRequestOptions
    );
    return response.data;
  };

  updateSLTP = async (position: UpdateSLTP) => {
    const formData = this.convertParamsToFormData(position);
    const response = await axios.post<OpenPositionResponseDTO>(
      `${API_STRING}${API_LIST.POSITIONS.UPDATE_SL_TP}`,
      formData,
      this.clientRequestOptions
    );
    return response.data;
  };

  updateToppingUp = async (position: UpdateToppingUp) => {
    const formData = this.convertParamsToFormData(position);
    const response = await axios.post<OpenPositionResponseDTO>(
      `${API_STRING}${API_LIST.POSITIONS.UPDATE_TOPPING_UP}`,
      formData,
      this.clientRequestOptions
    );
    return response.data;
  };

  confirmEmail = async (link: string, authUrl: string) => {
    const response = await axios.post<{ result: OperationApiResponseCodes }>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.PERSONAL_DATA.CONFIRM}`,
      {
        link,
      },
      this.clientRequestOptions
    );
    return response.data;
  };

  forgotEmail = async (email: string, authUrl: string) => {
    const response = await axios.post<{ result: OperationApiResponseCodes }>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.TRADER.FORGOT_PASSWORD}`,
      {
        email,
      },
      this.clientRequestOptions
    );
    return response.data;
  };

  recoveryPassword = async (
    params: RecoveryPasswordParams,
    authUrl: string
  ) => {
    const response = await axios.post<{ result: OperationApiResponseCodes }>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.TRADER.PASSWORD_RECOVERY}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  changePassword = async (params: ChangePasswordParams, authUrl: string) => {
    const response = await axios.post<ChangePasswordRespone>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.TRADER.CHANGE_PASSWORD}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  openPosition = async (position: OpenPositionModel) => {
    const formData = this.convertParamsToFormData(position);
    const response = await axios.post<OpenPositionResponseDTO>(
      `${API_STRING}${API_LIST.POSITIONS.OPEN}`,
      formData,
      this.clientRequestOptions
    );
    return response.data;
  };

  closePosition = async (position: ClosePositionModel) => {
    const formData = this.convertParamsToFormData(position);

    const response = await axios.post<OpenPositionResponseDTO>(
      `${API_STRING}${API_LIST.POSITIONS.CLOSE}`,
      formData,
      this.clientRequestOptions
    );
    return response.data;
  };

  createWithdrawal = async (
    params: CreateWithdrawalParams,
    tradingUrl: string
  ) => {
    const response = await axios.post<{
      status: WithdrawalHistoryResponseStatus;
    }>(
      `${API_WITHDRAWAL_STRING || tradingUrl}${API_LIST.WITHWRAWAL.CREATE}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  cancelWithdrawal = async (
    params: cancelWithdrawalParams,
    tradingUrl: string
  ) => {
    const response = await axios.post<WithdrawalHistoryDTO>(
      `${API_WITHDRAWAL_STRING || tradingUrl}${API_LIST.WITHWRAWAL.CANCEL}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  createDeposit = async (params: CreateDepositParams) => {
    const response = await axios.post<DepositCreateDTO>(
      `${API_DEPOSIT_STRING}${API_LIST.DEPOSIT.CREATE}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  createDepositInvoice = async (params: CreateDepositInvoiceParams) => {
    const response = await axios.post<CreateDepositInvoiceDTO>(
      `${API_DEPOSIT_STRING}${API_LIST.DEPOSIT.CREATE_INVOICE}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  createElectronicTransferInvoice = async (
    params: CreateElectronicFundsInvoiceParams
  ) => {
    const response = await axios.post<CreateElectronicFundsInvoiceDTO>(
      `${API_DEPOSIT_STRING}${API_LIST.DEPOSIT.CREATE_INVOICE_SWIFFY}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  createDirectaInvoice = async (params: CreateDirectaInvoiceParams) => {
    const response = await axios.post<CreateDirectaInvoiceDTO>(
      `${API_DEPOSIT_STRING}${API_LIST.DEPOSIT.CREATE_INVOICE_DIRECTA}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  createPayRetailersInvoice = async (
    params: CreatePayRetailersInvoiceParams
  ) => {
    const response = await axios.post<CreatePayRetailersInvoiceDTO>(
      `${API_DEPOSIT_STRING}${API_LIST.DEPOSIT.CREATE_INVOICE_PAY_RETAILERS}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  createPayopInvoice = async (params: CreatePayopInvoiceParams) => {
    const response = await axios.post<CreatePayopInvoiceDTO>(
      `${API_DEPOSIT_STRING}${API_LIST.DEPOSIT.CREATE_INVOICE_PAYOP}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  createVoltInvoice = async (params: CreateVoltInvoiceParams) => {
    const response = await axios.post<CreateVoltInvoiceDTO>(
      `${API_DEPOSIT_STRING}${API_LIST.DEPOSIT.CREATE_INVOICE_VOLT}`,
      params,
      this.clientRequestOptions
    );
    return response.data;
  };

  createMTAccounts = async (apiUrl: string) => {
    const response = await axios.post<MTCreateAccountDTO>(
      `${API_STRING || apiUrl}${API_LIST.MT5_ACCOUNTS.GET}`,
      {},
      this.clientRequestOptions
    );
    return response.data;
  };

  // -------------------

  //
  //  Background Request
  //
  //

  getAccounts = async () => {
    const response = await axios.get<AccountModelDTO[]>(
      `${API_STRING}${API_LIST.ACCOUNTS.GET_ACCOUNTS}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getAccountById = async (id: number) => {
    const response = await axios.get<AccountModelDTO>(
      `${API_STRING}${API_LIST.ACCOUNTS.GET_ACCOUNT_BY_ID}`,
      {
        params: {
          id,
        },
        ...this.backgroundRequestOptions,
      }
    );
    return response.data;
  };

  getHeaders = async () => {
    const response = await axios.get<string[]>(
      `${API_STRING}${API_LIST.ACCOUNTS.GET_HEADERS}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getPriceHistory = async (params: HistoryCandlesDTOType) => {
    const response = await axios.get<{ candles: CandleDTO[] }>(
    // const response = await axios.get<CandleDTO[]>(
      `${API_STRING}${API_LIST.PRICE_HISTORY.CANDLES}`,
      {
        params,
        ...this.backgroundRequestOptions,
      }
    );
    const bars = response.data.candles.map((item) => ({
      time: item.d,
      low: item.l,
      high: item.h,
      open: item.o,
      close: item.c,
    }));
    return bars;
  };

  getKeyValue = async (key: string) => {
    const response = await axios.get<string>(
      `${API_STRING}${API_LIST.KEY_VALUE.GET}`,
      {
        params: {
          key,
        },
        ...this.backgroundRequestOptions,
      }
    );
    return response.data;
  };

  setKeyValue = async (params: { key: string; value: string | boolean }) => {
    const formData = this.convertParamsToFormData(params);
    const response = await axios.post<void>(
      `${API_STRING}${API_LIST.KEY_VALUE.POST}`,
      formData,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getPositionsHistory = async (params: GetHistoryParams) => {
    const response = await axios.get<PositionsHistoryReportDTO>(
      `${API_STRING}${API_LIST.REPORTS.POSITIONS_HISTORY}`,
      {
        params,
        ...this.backgroundRequestOptions,
      }
    );
    return response.data;
  };

  getBalanceHistory = async (params: GetHistoryParams) => {
    const response = await axios.get<BalanceHistoryReport>(
      `${API_STRING}${API_LIST.REPORTS.BALANCE_HISTORY}`,
      {
        params,
        ...this.backgroundRequestOptions,
      }
    );
    return response.data;
  };

  getInitModel = async () => {
    const response = IS_LOCAL
      ? {
          data: {
            aboutUrl: '',
            androidAppLink: '',
            brandCopyrights: '',
            brandName: 'Monfex',
            brandProperty: BrandEnum.Monfex,
            faqUrl: '',
            withdrawFaqUrl: '',
            favicon: 'https://trading-test.mnftx.biz/br/favicon.ico',
            gaAsAccount: '',
            iosAppLink: '',
            logo: '',
            policyUrl: '',
            supportUrl: '',
            termsUrl: '',
            tradingUrl: '/',
            authUrl: '',
            mixpanelToken: '582507549d28c813188211a0d15ec940',
            recaptchaToken: '',
          } as InitModel,
        }
      : await axios.get<InitModel>(
          `${API_LIST.INIT.GET}`,
          this.backgroundRequestOptions
        );
    return response.data;
  };

  getPersonalData = async (processId: string, authUrl: string) => {
    const response = await axios.get<PersonalDataResponse>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.PERSONAL_DATA.GET}`,
      {
        params: {
          processId,
        },
        ...this.backgroundRequestOptions,
      }
    );
    return response.data;
  };

  postPersonalData = async (params: any, authUrl: string) => {
    const formData = this.convertParamsToFormData(params);

    const response = await axios.post<PersonalDataPostResponse>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.PERSONAL_DATA.POST}`,
      formData,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getCountries = async (lang = CountriesEnum.EN, authUrl: string) => {
    const languange = ListForEN[lang].shortName;
    const response = await axios.get<Country[]>(
      `${API_AUTH_STRING || authUrl}${
        AUTH_API_LIST.COMMON.COUNTRIES
      }/${languange}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  postDocument = async (
    documentType: DocumentTypeEnum,
    file: Blob,
    authUrl: string
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('processId', getProcessId());

    const response = await axios.post<void>(
      `${API_AUTH_STRING || authUrl}${
        AUTH_API_LIST.DOCUMENT.POST
      }/${documentType}`,
      formData,
      {
        ...this.backgroundRequestOptions,
        timeout: 600000,
      }
    );
    return response.data;
  };

  getFavoriteInstrumets = async (params: {
    type: AccountTypeEnum;
    accountId: string;
  }) => {
    const response = await axios.get<string[]>(
      `${API_STRING}${API_LIST.INSTRUMENTS.FAVOURITES}`,
      {
        params,
        ...this.backgroundRequestOptions,
      }
    );
    return response.data;
  };

  postFavoriteInstrumets = async (params: {
    type: AccountTypeEnum;
    accountId: string;
    instruments: string[];
  }) => {
    const response = await axios.post<string[]>(
      `${API_STRING}${API_LIST.INSTRUMENTS.FAVOURITES}`,
      params,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getSupportedSystems = async () => {
    const response = await axios.get(
      `${API_DEPOSIT_STRING}${API_LIST.DEPOSIT.CHECK_PAYMENT_SYSTEMS}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getCryptoWallet = async (params: GetCryptoWalletParams) => {
    const response = await axios.post<GetCryptoWalletDTO>(
      `${API_DEPOSIT_STRING}${API_LIST.DEPOSIT.GET_CRYPTO_WALLET}`,
      params,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getTradingUrl = async (authUrl: string) => {
    const response = await axios.get<ServerInfoType>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.COMMON.SERVER_INFO}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  refreshToken = async (params: RefreshToken, authUrl: string) => {
    const response = await axios.post<RefreshTokenDTO>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.TRADER.REFRESH_TOKEN}`,
      params,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  verifyUser = async (params: { processId: string }, authUrl: string) => {
    const response = await axios.post<{ result: OperationApiResponseCodes }>(
      `${API_AUTH_STRING || authUrl}${
        AUTH_API_LIST.PERSONAL_DATA.ON_VERIFICATION
      }`,
      params,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getWithdrawalHistory = async (tradingUrl: string) => {
    const response = await axios.get<WithdrawalHistoryDTO>(
      `${API_WITHDRAWAL_STRING || tradingUrl}${API_LIST.WITHWRAWAL.HISTORY}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };
  postLpLoginToken = async (params: LpLoginParams, authUrl: string) => {
    const response = await axios.post<UserAuthenticateResponse>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.TRADER.LP_LOGIN}`,
      params,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getAdditionalSignUpFields = async (authUrl: string) => {
    const response = await axios.get<string[]>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.TRADER.ADDITIONAL_FIELDS}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getGeolocationInfo = async (authUrl: string) => {
    const response = await axios.get<{
      country: string;
      dial: string;
    }>(
      `${API_AUTH_STRING || authUrl}${AUTH_API_LIST.COMMON.GEOLOCATION_INFO}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getMTAccounts = async (apiUrl: string) => {
    const response = await axios.get<MTAccountDTO[]>(
      `${API_STRING || apiUrl}${API_LIST.MT5_ACCOUNTS.GET}?deviceType=0`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getSubscribe = async (miscUrl: string) => {
    const needToAdd =
      (API_MISC_STRING || miscUrl).includes('/misc') || IS_LOCAL ? '' : '/misc';
    const response = await axios.get(
      `${API_MISC_STRING || miscUrl}${needToAdd}${
        API_LIST.ONESIGNAL.SUBSCRIBE
      }`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getOnBoardingInfoByStep = async (
    stepNumber: number,
    deviceType: number,
    miscUrl: string
  ) => {
    const needToAdd =
      (API_MISC_STRING || miscUrl).includes('/misc') || IS_LOCAL ? '' : '/misc';
    const response = await axios.get<OnBoardingInfo>(
      `${API_MISC_STRING || miscUrl}${needToAdd}${
        API_LIST.ONBOARDING.STEPS
      }/${stepNumber}?deviceTypeId=${deviceType}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getUserBonus = async (miscUrl: string) => {
    const needToAdd =
      (API_MISC_STRING || miscUrl).includes('/misc') || IS_LOCAL ? '' : '/misc';
    const response = await axios.get<IWelcomeBonusDTO>(
      `${API_MISC_STRING || miscUrl}${needToAdd}${API_LIST.WELCOME_BONUS.GET}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getListOfCourses = async (miscUrl: string) => {
    const needToAdd =
      (API_MISC_STRING || miscUrl).includes('/misc') || IS_LOCAL ? '' : '/misc';
    const response = await axios.get<IEducationCoursesDTO>(
      `${API_MISC_STRING || miscUrl}${needToAdd}${API_LIST.EDUCATION.LIST}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  getQuestionsByCourses = async (miscUrl: string, id: string) => {
    const needToAdd =
      (API_MISC_STRING || miscUrl).includes('/misc') || IS_LOCAL ? '' : '/misc';
    const response = await axios.get<IEducationQuestionsDTO>(
      `${API_MISC_STRING || miscUrl}${needToAdd}${
        API_LIST.EDUCATION.LIST
      }/${id}`,
      this.backgroundRequestOptions
    );
    return response.data;
  };

  saveProgressEducation = async (
    miscUrl: string,
    id: string,
    index: number
  ) => {
    const needToAdd =
      (API_MISC_STRING || miscUrl).includes('/misc') || IS_LOCAL ? '' : '/misc';
    const response = await axios.post<IEducationCoursesDTO>(
      `${API_MISC_STRING || miscUrl}${needToAdd}${
        API_LIST.EDUCATION.LIST
      }/${id}/saveProgress`,
      {
        lastQuestionId: index,
      },
      this.backgroundRequestOptions
    );
    return response.data;
  };

  postDebug = async (params: DebugTypes, apiUrl: string) => {
    const response = await axios.post<DebugResponse>(
      `${API_STRING || apiUrl}${API_LIST.DEBUG.POST}`,
      params
    );
    return response.data;
  };

  testBGrequest = async () => {
    const response = await axios.get(
      `http://localhost:5000`,
      this.backgroundRequestOptions
    );
    return response.data;
  };
  testClinetrequest = async () => {
    const response = await axios.get(
      `http://localhost:5000`,
      this.clientRequestOptions
    );
    return response.data;
  };
}

export default new API();
