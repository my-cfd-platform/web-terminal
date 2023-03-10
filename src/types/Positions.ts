import { OperationApiResponseCodes } from '../enums/OperationApiResponseCodes';
import { AskBidEnum } from '../enums/AskBid';
import { TpSlTypeEnum } from '../enums/TpSlTypeEnum';

export interface OpenPositionModel {
  processId: string;
  accountId: string;
  investmentAmount: number;
  instrumentId: string;
  operation: AskBidEnum;
  multiplier: number;
  tp: number | null;
  sl: number | null;
  tpType: TpSlTypeEnum | null;
  slType: TpSlTypeEnum | null;
  isToppingUpActive: boolean;
}

export interface OpenPendingOrder {
  processId: string;
  accountId: string;
  investmentAmount: number;
  instrumentId: string;
  operation: AskBidEnum;
  multiplier: number;
  openPrice: number;
  tp: number | null;
  sl: number | null;
  tpType: TpSlTypeEnum | null;
  slType: TpSlTypeEnum | null;
  isToppingUpActive: boolean;
}

export interface FormValues {
  investmentAmount: number;
  tp?: number;
  sl?: number;
  openPrice?: number;
  isToppingUpActive: boolean;
}

export interface OpenPositionResponseDTO {
  result: OperationApiResponseCodes;
  position: PositionModelWSDTO;
}

export interface PositionModelWSDTO {
  id: number;
  investmentAmount: number;
  reservedFundsForToppingUp: number;
  openPrice: number;
  openDate: number;
  instrument: string;
  multiplier: number;
  operation: number;
  swap: number;
  commission: number;
  tp: number | null;
  sl: number | null;
  tpType: TpSlTypeEnum | null;
  slType: TpSlTypeEnum | null;
  timeStamp: number;
  isToppingUpActive: boolean;
}

export interface ClosePositionModel {
  accountId: string;
  positionId: number;
  processId: string;
}

export interface RemovePendingOrders {
  processId: string;
  accountId: string;
  orderId: number;
}

export interface UpdateSLTP {
  processId: string;
  accountId: string;
  investmentAmount: number;
  positionId: number;
  multiplier: number;
  operation: AskBidEnum;
  instrumentId: string;
  tp: number | null;
  sl: number | null;
  tpType: TpSlTypeEnum | null;
  slType: TpSlTypeEnum | null;
  isToppingUpActive: boolean;
}

export interface UpdateToppingUp {
  processId: string;
  accountId: string;
  positionId: number;
  isToppingUpActive: boolean;
}