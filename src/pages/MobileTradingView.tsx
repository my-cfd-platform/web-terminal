import React, { useState, useEffect, FC } from 'react';
import { HubConnection } from '@aspnet/signalr';
import Axios from 'axios';
import initConnection from '../services/websocketService';
import Topics from '../constants/websocketTopics';
import { FlexContainer } from '../styles/FlexContainer';
import mobileChartMessageTypes from '../constants/MobileChartMessageTypes';
import {
  IChartingLibraryWidget, ChartingLibraryWidgetOptions, SeriesStyle, widget,
} from '../vendor/charting_library/charting_library.min';
import {
  supportedResolutions,
  SupportedResolutionsType,
  supportedInterval,
} from '../constants/supportedTimeScales';
import moment from 'moment';
import DataFeedService from '../services/dataFeedService';
import { BASIC_RESOLUTION_KEY } from '../constants/chartValues';
import ColorsPallete from '../styles/colorPallete';
import { LineStyles } from '../enums/TradingViewStyles';

const containerId = 'tv_chart_container';


const MobileTradingView: FC = () => {
  const [activeSession, setActiveSession] = useState<HubConnection>();
  const [instrumentId, setInstrumentId] = useState('');
  const [tvWidget, setTvWidget] = useState<IChartingLibraryWidget>();

  const initWebsocketConnection = async (
    token: string,
    instrumentId: string
  ) => {
    setInstrumentId(instrumentId);
    const connection = initConnection(WS_HOST);
    try {
      await connection.start();
      setActiveSession(connection);
      try {
        await connection.send(Topics.INIT, token);
      } catch (error) {
        alert(`ws connection error ${JSON.stringify(error)}`);
      }
    } catch (error) {}
  };

  const setInterval = (newInterval: string) => {
    let from = moment();
    let newResolutionKey: SupportedResolutionsType = '1 minute';
    switch (newInterval) {
      case supportedInterval['1D']:
        from = moment().subtract(1, 'd');
        newResolutionKey = '1 minute';
        break;

      case supportedInterval['5D']:
        from = moment().subtract(5, 'd');
        newResolutionKey = '30 minutes';
        break;

      case supportedInterval['1M']:
        from = moment().subtract(1, 'M');
        newResolutionKey = '1 hour';
        break;

      case supportedInterval['YTD']:
        from = moment().subtract(new Date().getUTCMonth(), 'M');
        newResolutionKey = '1 day';
        break;

      case supportedInterval['1Y']:
        from = moment().subtract(1, 'year');
        newResolutionKey = '1 day';
        break;

      case supportedInterval['3Y']:
        from = moment().subtract(1, 'y');
        newResolutionKey = '1 day';
        break;

      case supportedInterval['All']:
        from = moment().subtract(1, 'y');
        newResolutionKey = '1 day';
        break;

      default:
        break;
    }

    tvWidget
      ?.chart()
      .setResolution(supportedResolutions[newResolutionKey], () => {
        tvWidget?.chart().setVisibleRange({
          from: from.valueOf(),
          to: moment().valueOf(),
        });
      });
  };

  const messageHandler = (e: MessageEvent) => {
   const data = JSON.parse(e.data)
    if (!activeSession) {
      Axios.defaults.headers['Authorization'] = data.auth;
      initWebsocketConnection(data.auth, data.instrument);
    }

    if (data.type) {
      switch (data.type) {
        case mobileChartMessageTypes.SET_CANDLE_TYPE:
          tvWidget?.chart().setChartType(data.message);
          break;

        case mobileChartMessageTypes.SET_INSTRUMENT:
          tvWidget?.setSymbol(data.instrument, data.interval, () => {});
          break;

        case mobileChartMessageTypes.SET_INTERVAL:
          setInterval(data);
          break;

        case mobileChartMessageTypes.SET_RESOLUTION:
          tvWidget?.chart().setResolution(data.resolution, () => {});
          break;

        default:
          break;
      }
    }
  };

  useEffect(() => {

    window.addEventListener('message', messageHandler, false);
    // const { port1, port2 } = new MessageChannel();

    // port1.addEventListener(
    //   'message',
    //   function(e) {
    //    alert(`message from port1 ${e.data}`);
    //   },
    //   false
    // );

    // port2.addEventListener(
    //   'message',
    //   function(e) {
    //     alert(`message port2 ${JSON.stringify(e.data)}`);
    //   },
    //   false
    // );
    // port1.start();
    // port2.start();
  }, []);

  useEffect(() => {
    if (activeSession) {
      const widgetOptions: ChartingLibraryWidgetOptions = {
        symbol: instrumentId,
        datafeed: new DataFeedService(activeSession, instrumentId),
        interval: supportedResolutions[BASIC_RESOLUTION_KEY],
        container_id: containerId,
        library_path: CHARTING_LIBRARY_PATH,
        locale: 'en',
        custom_css_url: 'custom_trading_view_styles.css',
        disabled_features: [
          'header_widget',
          'timeframes_toolbar',
          'use_localstorage_for_settings',
          'border_around_the_chart',
          'left_toolbar',
          'symbol_info',
          'context_menus',
          'main_series_scale_menu',
        ],
        enabled_features: ['remove_library_container_border'],
        fullscreen: false,
        autosize: true,
        overrides: {
          'symbolWatermarkProperties.transparency': 90,
          'mainSeriesProperties.style': SeriesStyle.Area,
          'mainSeriesProperties.lineStyle.color': ColorsPallete.MINT,
          'mainSeriesProperties.lineStyle.linestyle':
            LineStyles.LINESTYLE_SOLID,
          'mainSeriesProperties.lineStyle.linewidth': 3,
          'mainSeriesProperties.lineStyle.priceSource': 'close',
          'mainSeriesProperties.areaStyle.color1': 'rgba(0, 255, 221, 0.08)',
          'mainSeriesProperties.areaStyle.color2': 'rgba(0, 255, 221, 0.08)',
          'mainSeriesProperties.areaStyle.linecolor': ColorsPallete.MINT,
          'mainSeriesProperties.areaStyle.linestyle':
            LineStyles.LINESTYLE_SOLID,
          'mainSeriesProperties.areaStyle.linewidth': 3,
          'mainSeriesProperties.candleStyle.upColor': '#21B3A4',
          'mainSeriesProperties.candleStyle.downColor': '#ed145b',
          'mainSeriesProperties.candleStyle.drawWick': true,
          'mainSeriesProperties.candleStyle.drawBorder': false,
          'mainSeriesProperties.candleStyle.borderColor': '#28555a',
          'mainSeriesProperties.candleStyle.borderUpColor': '#21B3A4',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ed145b',
          'mainSeriesProperties.candleStyle.wickUpColor': '#255258',
          'mainSeriesProperties.candleStyle.wickDownColor': '#622243',
          'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
          'mainSeriesProperties.areaStyle.priceSource': 'close',
          'paneProperties.axisProperties.autoScale': false,
          'paneProperties.vertGridProperties.color':
            'rgba(255, 255, 255, 0.08)',
          'paneProperties.vertGridProperties.style':
            LineStyles.LINESTYLE_DOTTED,
          'paneProperties.horzGridProperties.color':
            'rgba(255, 255, 255, 0.08)',
          'paneProperties.horzGridProperties.style':
            LineStyles.LINESTYLE_DOTTED,
          'paneProperties.legendProperties.showStudyArguments': false,
          'paneProperties.legendProperties.showStudyTitles': false,
          'paneProperties.legendProperties.showStudyValues': false,
          'paneProperties.legendProperties.showSeriesTitle': false,
          'paneProperties.legendProperties.showSeriesOHLC': true,
          'paneProperties.legendProperties.showLegend': false,
          'paneProperties.legendProperties.showBarChange': false,
          'paneProperties.legendProperties.showOnlyPriceSource': false,
          'linetoolnote.backgroundColor': ColorsPallete.RAZZMATAZZ,
          'scalesProperties.lineColor': 'transparent',
          'scalesProperties.textColor': 'rgba(255, 255, 255, 0.2)',
          'scalesProperties.backgroundColor': 'transparent',
          'paneProperties.background': 'rgba(0,0,0,0)',
          'mainSeriesProperties.priceLineColor': '#fff',
          'mainSeriesProperties.priceLineWidth': 2,
          'timeScale.rightOffset': 5,
        },
      };

      setTvWidget(new widget(widgetOptions));
    }
  }, [activeSession]);

useEffect(() => {
  tvWidget?.onChartReady(() => {});
}, [tvWidget]);

  return (
    <FlexContainer height="100vh" width="100vw">
      <FlexContainer width="100%">
        <FlexContainer width="100%" height="100%" id={containerId} />
      </FlexContainer>
    </FlexContainer>
  );
};

export default MobileTradingView;
