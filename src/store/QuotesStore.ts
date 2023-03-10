import { action, makeAutoObservable } from 'mobx';
import { BidAskKeyValueList, BidAskModelWSDTO } from '../types/BidAsk';
import { PositionModelWSDTO } from '../types/Positions';
import calculateFloatingProfitAndLoss from '../helpers/calculateFloatingProfitAndLoss';
import { AskBidEnum } from '../enums/AskBid';
import { PendingOrderWSDTO } from '../types/PendingOrdersTypes';
import { SortByProfitEnum } from '../enums/SortByProfitEnum';
import { RootStore } from './RootStore';
import { SortByPendingOrdersEnum } from '../enums/SortByPendingOrdersEnum';
import hasValue from '../helpers/hasValue';

interface IQuotesStore {
  quotes: BidAskKeyValueList;
  activePositions: PositionModelWSDTO[];
  invest: number;
  total: number;
  totalEquity: number;
  profit: number;
  pendingOrders: PendingOrderWSDTO[];
}

export class QuotesStore implements IQuotesStore {
  quotes: BidAskKeyValueList = {};
  activePositions: PositionModelWSDTO[] = [];
  pendingOrders: PendingOrderWSDTO[] = [];
  rootStore: RootStore;
  selectedPositionId: PositionModelWSDTO['id'] | null = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this, { rootStore: false });
    this.rootStore = rootStore;
  }

  @action
  setQuote = (quote: BidAskModelWSDTO) => {
    this.quotes[quote.id] = quote;
  };

  @action
  setActivePositions = (activePositions: PositionModelWSDTO[]) => {
    this.activePositions = activePositions.map((item) => ({
      ...item,
      sl: hasValue(item.sl) ? Math.abs(item.sl!) : item.sl,
    }));
  };

  get profit() {
    return this.activePositions.reduce(
      (acc, prev) =>
        acc +
        calculateFloatingProfitAndLoss({
          investment: prev.investmentAmount,
          multiplier: prev.multiplier,
          costs: prev.swap + prev.commission,
          side: prev.operation === AskBidEnum.Buy ? 1 : -1,
          currentPrice: this.quotes[prev.instrument]
            ? this.quotes[prev.instrument][
                prev.operation === AskBidEnum.Buy ? 'bid' : 'ask'
              ].c
            : 0,
          openPrice: prev.openPrice,
        }),
      0
    );
  }

  get invest() {
    return this.activePositions.reduce(
      (acc, prev) => acc + prev.investmentAmount,
      0
    );
  }

  get totalReservedFoundsForToppingUp() {
    let value: number = 0;
    this.activePositions.map((pos) => value += pos.reservedFundsForToppingUp);
    return value;
  }

  get total() {
    return (
      this.profit +
      (this.rootStore.mainAppStore.activeAccount?.balance || 0) +
      this.invest + this.totalReservedFoundsForToppingUp
    );
  }

  get totalEquity() {
    return this.profit + this.invest + this.totalReservedFoundsForToppingUp;
  }

  // TODO: move to sorting store?
  get sortedActivePositions() {
    let filterByFunc;

    switch (this.rootStore.sortingStore.activePositionsSortBy) {
      case SortByProfitEnum.NewFirstAsc:
        filterByFunc = this.sortByDateOpened(true);
        break;

      case SortByProfitEnum.NewFirstDesc:
        filterByFunc = this.sortByDateOpened(false);
        break;

      case SortByProfitEnum.ProfitAsc:
        filterByFunc = this.sortByPnLPositions(true);
        break;

      case SortByProfitEnum.ProfitDesc:
        filterByFunc = this.sortByPnLPositions(false);
        break;

      case SortByProfitEnum.InvestmentAsc:
        filterByFunc = this.sortByInvestment(true);
        break;

      case SortByProfitEnum.InvestmentDesc:
        filterByFunc = this.sortByInvestment(false);
        break;

      default:
        break;
    }
    return this.activePositions.slice().sort(filterByFunc);
  }

  get sortedPendingOrders() {
    let filterByFunc;

    switch (this.rootStore.sortingStore.pendingOrdersSortBy) {
      case SortByPendingOrdersEnum.NewFirstAsc:
        filterByFunc = this.sortByDateOpenedPendingOrders(true);
        break;

      case SortByPendingOrdersEnum.NewFirstDesc:
        filterByFunc = this.sortByDateOpenedPendingOrders(false);
        break;

      case SortByPendingOrdersEnum.InvestmentAsc:
        filterByFunc = this.sortByInvestment(true);
        break;

      case SortByPendingOrdersEnum.InvestmentDesc:
        filterByFunc = this.sortByInvestment(false);
        break;

      default:
        break;
    }
    return this.pendingOrders.slice().sort(filterByFunc);
  }

  sortByDateOpened = (ascending: boolean) => (
    a: PositionModelWSDTO,
    b: PositionModelWSDTO
  ) => (ascending ? b.openDate - a.openDate : a.openDate - b.openDate);

  sortByDateOpenedPendingOrders = (ascending: boolean) => (
    a: PendingOrderWSDTO,
    b: PendingOrderWSDTO
  ) => (ascending ? b.created - a.created : a.created - b.created);

  sortByInvestment = (ascending: boolean) => (
    a: PositionModelWSDTO | PendingOrderWSDTO,
    b: PositionModelWSDTO | PendingOrderWSDTO
  ) =>
    ascending
      ? b.investmentAmount - a.investmentAmount
      : a.investmentAmount - b.investmentAmount;

  // TODO: think how to reduce calculations
  sortByPnLPositions = (ascending: boolean) => (
    a: PositionModelWSDTO,
    b: PositionModelWSDTO
  ) => {
    const aProfitNLoss = calculateFloatingProfitAndLoss({
      investment: b.investmentAmount,
      multiplier: b.multiplier,
      costs: b.swap + b.commission,
      side: b.operation === AskBidEnum.Buy ? 1 : -1,
      currentPrice:
        b.operation === AskBidEnum.Buy
          ? this.quotes[b.instrument].bid.c
          : this.quotes[b.instrument].ask.c,
      openPrice: b.openPrice,
    });

    const bProfitNLoss = calculateFloatingProfitAndLoss({
      investment: a.investmentAmount,
      multiplier: a.multiplier,
      costs: a.swap + a.commission,
      side: a.operation === AskBidEnum.Buy ? 1 : -1,
      currentPrice:
        a.operation === AskBidEnum.Buy
          ? this.quotes[a.instrument].bid.c
          : this.quotes[a.instrument].ask.c,
      openPrice: a.openPrice,
    });
    return ascending
      ? bProfitNLoss - aProfitNLoss
      : aProfitNLoss - bProfitNLoss;
  };

  @action
  setPendingOrders = (pendingOrders: PendingOrderWSDTO[]) => {
    this.pendingOrders = pendingOrders;
  };

  get selectedPosition() {
    return this.activePositions.find(
      (item) => item.id === this.selectedPositionId
    );
  }

  @action
  setSelectedPositionId = (id: PositionModelWSDTO['id'] | null) => {
    this.selectedPositionId = id;
  };
}
