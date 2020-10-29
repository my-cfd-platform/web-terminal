import { action, computed, observable } from 'mobx';
import { AskBidEnum } from '../enums/AskBid';
import { PositionModelWSDTO } from '../types/Positions';
import { IExecutionLineAdapter } from '../vendor/charting_library/charting_library';
import { RootStore } from './RootStore';

interface IMarkersOnChartStore {
  activeMarkers: Marker[];
}

interface Marker {
  positionId: number;
  marker: IExecutionLineAdapter;
}

export class MarkersOnChartStore implements IMarkersOnChartStore {
  rootStore: RootStore;
  @observable activeMarkers: Marker[] = [];

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @action
  renderActivePositionsMarkersOnChart = () => {
    this.clearMarkersOnChart();

    this.rootStore.quotesStore.activePositions.forEach((position) => {
      if (
        this.rootStore.instrumentsStore.activeInstrument?.instrumentItem.id ===
        position.instrument
      ) {
        const marker = this.rootStore.tradingViewStore.tradingWidget
          ?.chart()
          .createExecutionShape({ disableUndo: false })
          .setText(`$${Math.floor(position.investmentAmount)}`)
          .setTextColor(
            position.operation === AskBidEnum.Buy ? '#00ffdd' : '#ed145b'
          )
          .setArrowColor(
            position.operation === AskBidEnum.Buy ? '#00ffdd' : '#ed145b'
          )
          .setDirection(position.operation === AskBidEnum.Buy ? 'buy' : 'sell')
          .setTime((position.openDate - 1000) / 1000)
          .setPrice(position.openPrice)
          .setArrowSpacing(0);

        if (marker) {
          this.activeMarkers.push({
            positionId: position.id,
            marker,
          });
          this.rootStore.tradingViewStore.tradingWidget?.activeChart().sendBackward([
            //@ts-ignore
            marker._line._id,
          ]);
        }
      }
    });
  };

  @action
  addNewMarker = (position: PositionModelWSDTO) => {
    const marker = this.rootStore.tradingViewStore.tradingWidget
      ?.chart()
      .createExecutionShape({ disableUndo: false })
      .setText(`$${Math.floor(position.investmentAmount)}`)
      .setTextColor(
        position.operation === AskBidEnum.Buy ? '#00ffdd' : '#ed145b'
      )
      .setArrowColor(
        position.operation === AskBidEnum.Buy ? '#00ffdd' : '#ed145b'
      )
      .setDirection(position.operation === AskBidEnum.Buy ? 'buy' : 'sell')
      .setTime((position.openDate - 1000) / 1000)
      .setPrice(position.investmentAmount);
    if (marker) {
      this.activeMarkers.push({
        positionId: position.id,
        marker,
      });
      this.rootStore.tradingViewStore.tradingWidget?.activeChart().sendBackward([
        //@ts-ignore
        marker._line._id,
      ]);
    }
  };

  @action
  clearMarkersOnChart = () => {
    this.activeMarkers.forEach((item) => {
      item.marker.remove();
    });
    this.activeMarkers = [];
  };

  @action
  removeMarkerByPositionId = (positionId: Marker['positionId']) => {
    this.activeMarkers
      .find((item) => item.positionId === positionId)
      ?.marker.remove();

    this.activeMarkers = this.activeMarkers.filter(
      (item) => item.positionId !== positionId
    );
  };
}
