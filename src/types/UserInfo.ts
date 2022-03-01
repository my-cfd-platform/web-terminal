import { OperationApiResponseCodes } from '../enums/OperationApiResponseCodes';
import { WelcomeBonusResponseEnum } from '../enums/WelcomeBonusResponseEnum';

export interface UserAuthenticate {
  email: string;
  password: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  repeatPassword?: string;
  userAgreement?: boolean;
  captcha: string;
  phone?: string;
  country?: string;
}

export interface UserForgotPassword {
  email: string;
}

export interface IResetPassword {
  password: string;
  repeatPassword?: string;
}

export interface RecoveryPasswordParams {
  password: string;
  token: string;
}

export interface ChangePasswordRespone {
  result: OperationApiResponseCodes;
}

export interface UserAuthenticateResponse {
  result: OperationApiResponseCodes;
  data: {
    token: string;
    tradingUrl: string;
    connectionTimeOut: string;
    reconnectTimeOut: string;
    refreshToken: string;
    mt5Enabled: boolean;
  };
}

export interface LpLoginParams {
  token: string;
}

export interface IWelcomeBonusExpirations {
  bonusPercentageFromFtd: number;
  expirationDateUtc: number;
}

export interface IWelcomeBonus {
  welcomeBonus: {
    ftdFrom: number;
    maxBonusAmount: number;
  };
  welcomeBonusExpirations: IWelcomeBonusExpirations[];
}

export interface IWelcomeBonusDTO {
  responseCode: WelcomeBonusResponseEnum;
  data: IWelcomeBonus;
}
