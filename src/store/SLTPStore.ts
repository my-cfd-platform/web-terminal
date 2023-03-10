import { action, makeAutoObservable } from 'mobx';
import { AskBidEnum } from '../enums/AskBid';
import { TpSlTypeEnum } from '../enums/TpSlTypeEnum';
import { RootStore } from './RootStore';

interface ContextProps {
  tpType: TpSlTypeEnum;
  slType: TpSlTypeEnum;
  instrumentId: string;
  closedByChart: boolean;
}

type PricePosStopOut = {
  slPrice: number;
  investmentAmount: number;
  operation: AskBidEnum;
  instrumentId: string;
  multiplier: number;
  commission: number;
  isNewOrder?: boolean;
  openPrice?: number;
};

export class SLTPStore implements ContextProps {
  tpType: TpSlTypeEnum = TpSlTypeEnum.Currency;
  slType: TpSlTypeEnum = TpSlTypeEnum.Currency;
  closedByChart: boolean = false;
  instrumentId: string = '';
  instrumentIdNewOrder: string = '';
  rootStore: RootStore;
  closeOpenPrice: boolean = false;
  tpTypeNewOrder: TpSlTypeEnum = TpSlTypeEnum.Currency;
  slTypeNewOrder: TpSlTypeEnum = TpSlTypeEnum.Currency;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this, {
      rootStore: false,
    });
    this.rootStore = rootStore;
  }

  @action
  clearStore = () => {
    this.setTpType(TpSlTypeEnum.Currency);
    this.setSlType(TpSlTypeEnum.Currency);
  };

  @action
  toggleClosedByChart = (value: boolean) => {
    this.closedByChart = value;
  };

  @action
  toggleCloseOpenPrice = (value: boolean) => {
    this.closeOpenPrice = value;
  };

  @action
  setTpType = (tpType: TpSlTypeEnum) => {
    this.tpType = tpType;
  };

  @action
  setSlType = (slType: TpSlTypeEnum) => {
    this.slType = slType;
  };

  @action
  setTpTypeNewOrder = (tpType: TpSlTypeEnum) => {
    this.tpTypeNewOrder = tpType;
  };

  @action
  setSlTypeNewOrder = (slType: TpSlTypeEnum) => {
    this.slTypeNewOrder = slType;
  };

  @action
  setInstrumentId = (instrumentId: string) => {
    this.instrumentId = instrumentId;
  };

  @action
  setInstrumentIdNewOrder = (instrumentId: string) => {
    this.instrumentIdNewOrder = instrumentId;
  };

  private _getPostitionStopOut = (invest = 0, instrumentId: string) => {
    const instrumentPercentSL =
      (this.rootStore.instrumentsStore.instruments.find(
        (item) => item.instrumentItem.id === instrumentId
      )?.instrumentItem.stopOutPercent || 95) / 100;

    return +(invest * instrumentPercentSL).toFixed(2);
  };

  /**
   *  Stop Out max level
   */
  public get positionStopOut() {
    return this._getPostitionStopOut;
  }

  public set positionStopOut(value) {
    this._getPostitionStopOut = value;
  }

  /**
   *  Stop Out max level by price SL
   */
  positionStopOutByPrice = ({
    slPrice,
    investmentAmount,
    operation,
    instrumentId,
    multiplier,
    commission,
    isNewOrder,
    openPrice,
  }: PricePosStopOut) => {
    const isBuy = operation === AskBidEnum.Buy;
    const direction = operation === AskBidEnum.Buy ? 1 : -1;

    let currentPrice = 0;
    if (isNewOrder) {
      currentPrice = isBuy
        ? this.getCurrentPriceAsk(instrumentId)
        : this.getCurrentPriceBid(instrumentId);
    } else {
      currentPrice = openPrice || 0; 
    }

    // const so_level = -1 * this.positionStopOut(investmentAmount, instrumentId);

    // const so_percent =
    //   (this.rootStore.instrumentsStore.instruments.find(
    //     (item) => item.instrumentItem.id === instrumentId
    //   )?.instrumentItem.stopOutPercent || 0) / 100;

    // const commissions = this.rootStore.instrumentsStore.instruments.find(
    //   (item) => item.instrumentItem.id === instrumentId
    // )?.instrumentItem.

    //(SL RATE / Current Price - 1) * Investment * Multiplier * Direction + Commissions

    const result =
      (slPrice / currentPrice - 1) * investmentAmount * multiplier * direction +
      commission;

    return +result.toFixed(2);
  };

  getCurrentPriceBid = (instrumentId: string) =>
    this.rootStore.quotesStore.quotes[instrumentId]
      ? this.rootStore.quotesStore.quotes[instrumentId].bid.c
      : 0;

  getCurrentPriceAsk = (instrumentId: string) =>
    this.rootStore.quotesStore.quotes[instrumentId]
      ? this.rootStore.quotesStore.quotes[instrumentId].ask.c
      : 0;
}
