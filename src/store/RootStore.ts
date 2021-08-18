import { QuotesStore } from './QuotesStore';
import { MainAppStore } from './MainAppStore';
import { TabsStore } from './TabsStore';
import { TradingViewStore } from './TradingViewStore';
import { InstrumentsStore } from './InstrumentsStore';
import { DateRangeStore } from './DateRangeStore';
import { HistoryStore } from './HistoryStore';
import { KYCstore } from './KYCstore';
import { NotificationStore } from './NotificationStore';
import { SortingStore } from './SortingStore';
import { BadRequestPopupStore } from './BadRequestPopupStore';
import { DepositFundsStore } from './DepositFundsStore';
import { DataRangeStoreNoCustomDates } from './DataRangeStoreNoCustomDates';
import { WithdrawalStore } from './WithdrawalStore';
import { DateRangeAccountBalanceStore } from './DateRangeAccountBalanceStore';
import { PhoneVerificationStore } from './PhoneVerificationStore';
import { MarkersOnChartStore } from './MarkersOnChartStore';
import { SLTPStore } from './SLTPStore';
import { makeAutoObservable } from 'mobx';

export class RootStore {
  quotesStore: QuotesStore;
  mainAppStore: MainAppStore;
  tabsStore: TabsStore;
  tradingViewStore: TradingViewStore;
  instrumentsStore: InstrumentsStore;
  dateRangeStore: DateRangeStore;
  dateRangeAccountBalanceStore: DateRangeAccountBalanceStore;
  dataRangeStoreNoCustomDates: DataRangeStoreNoCustomDates;
  historyStore: HistoryStore;
  kycStore: KYCstore;
  notificationStore: NotificationStore;
  sortingStore: SortingStore;
  badRequestPopupStore: BadRequestPopupStore;
  depositFundsStore: DepositFundsStore;
  withdrawalStore: WithdrawalStore;
  phoneVerificationStore: PhoneVerificationStore;
  markersOnChartStore: MarkersOnChartStore;
  SLTPstore: SLTPStore;

  constructor() {
    this.quotesStore = new QuotesStore(this);
    this.mainAppStore = new MainAppStore(this);
    this.tabsStore = new TabsStore();
    this.tradingViewStore = new TradingViewStore(this);
    this.instrumentsStore = new InstrumentsStore(this);
    this.dateRangeStore = new DateRangeStore();
    this.dateRangeAccountBalanceStore = new DateRangeAccountBalanceStore();
    this.dataRangeStoreNoCustomDates = new DataRangeStoreNoCustomDates();
    this.historyStore = new HistoryStore();
    this.kycStore = new KYCstore();
    this.notificationStore = new NotificationStore();
    this.sortingStore = new SortingStore(this);
    this.badRequestPopupStore = new BadRequestPopupStore(this);
    this.depositFundsStore = new DepositFundsStore();
    this.withdrawalStore = new WithdrawalStore();
    this.phoneVerificationStore = new PhoneVerificationStore();
    this.markersOnChartStore = new MarkersOnChartStore(this);
    this.SLTPstore = new SLTPStore(this);
  }
}
