import React, { FC, useEffect } from 'react';
import {
  ChartingLibraryWidgetOptions,
  LanguageCode,
  widget,
  SeriesStyle,
} from '../vendor/charting_library/charting_library.min';
import { FlexContainer } from '../styles/FlexContainer';
import DataFeedService from '../services/dataFeedService';
import { supportedResolutions } from '../constants/supportedResolutionsTimeScale';
import { LineStyles } from '../enums/TradingViewStyles';
import ColorsPallete from '../styles/colorPallete';
import { InstrumentModelWSDTO } from '../types/Instruments';
import { useStores } from '../hooks/useStores';

function getLanguageFromURL(): LanguageCode | null {
  const regex = new RegExp('[\\?&]lang=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null
    ? null
    : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode);
}

const containerId = 'tv_chart_container';

interface IProps {
  intrument: InstrumentModelWSDTO;
}

const ChartContainer: FC<IProps> = ({ intrument }) => {
  const { mainAppStore, tradingViewStore } = useStores();
  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: intrument.id,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: new DataFeedService(mainAppStore.activeSession!, intrument),
      interval: supportedResolutions[0],
      container_id: containerId,
      library_path: CHARTING_LIBRARY_PATH,
      locale: getLanguageFromURL() || 'en',
      custom_css_url: 'custom_trading_view_styles.css',
      time_frames: [
        { text: '10y', resolution: '6M', description: '10 Years' },
        { text: '1y', resolution: 'W', description: '1 Years', title: '1yr' },
        { text: '1m', resolution: 'D', description: '1 Month' },
        { text: '1d', resolution: '1', description: '1 Days' },
      ],
      // debug: true,
      disabled_features: [
        'header_widget',
        'legend_widget',
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
        'mainSeriesProperties.candleStyle.wickUpColor': '#336854',
        'mainSeriesProperties.candleStyle.wickDownColor': '#7f323f',
        'mainSeriesProperties.lineStyle.color': ColorsPallete.MINT,
        'mainSeriesProperties.lineStyle.linestyle': LineStyles.LINESTYLE_SOLID,
        'mainSeriesProperties.lineStyle.linewidth': 3,
        'mainSeriesProperties.lineStyle.priceSource': 'close',
        'mainSeriesProperties.areaStyle.color1': 'rgba(0, 255, 221, 0.08)',
        'mainSeriesProperties.areaStyle.color2': 'rgba(0, 255, 221, 0.08)',
        'mainSeriesProperties.areaStyle.linecolor': ColorsPallete.MINT,
        'mainSeriesProperties.areaStyle.linestyle': LineStyles.LINESTYLE_SOLID,
        'mainSeriesProperties.areaStyle.linewidth': 3,
        'mainSeriesProperties.areaStyle.priceSource': 'close',
        'paneProperties.axisProperties.autoScale': false,
        'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.08)',
        'paneProperties.vertGridProperties.style': LineStyles.LINESTYLE_DOTTED,
        'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.08)',
        'paneProperties.horzGridProperties.style': LineStyles.LINESTYLE_DOTTED,
        'paneProperties.legendProperties.showStudyArguments': false,
        'paneProperties.legendProperties.showStudyTitles': false,
        'paneProperties.legendProperties.showStudyValues': false,
        'paneProperties.legendProperties.showSeriesTitle': false,
        'paneProperties.legendProperties.showSeriesOHLC': false,
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

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(async () => {
      tradingViewStore.tradingWidget = tvWidget;
    });
    return () => {
      tvWidget.remove();
    };
  }, []);

  return <FlexContainer width="100%" height="100%" id={containerId} />;
};

export default ChartContainer;