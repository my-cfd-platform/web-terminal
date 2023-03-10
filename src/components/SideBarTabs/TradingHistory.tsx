import React, { FC, useCallback, useEffect, useState } from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import styled from '@emotion/styled';
import { useStores } from '../../hooks/useStores';
import { observer, Observer } from 'mobx-react-lite';
import { PrimaryTextSpan } from '../../styles/TextsElements';
import API from '../../helpers/API';
import IconNoTradingHistory from '../../assets/svg/icon-no-trading-history.svg';
import SvgIcon from '../SvgIcon';
import TradingHistoryItem from './TradingHistoryItem';
import DatePickerDropdownNoCustomDates from '../DatePickerDropdownNoCustomDates';
import LoaderForComponents from '../LoaderForComponents';
import InfinityScrollList from '../InfinityScrollList';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import {
  LOCAL_HISTORY_DATERANGE,
  LOCAL_HISTORY_PAGE,
  LOCAL_HISTORY_POSITION,
  LOCAL_HISTORY_TIME,
} from '../../constants/global';
import { PositionHistoryDTO } from '../../types/HistoryReportTypes';
import { ShowDatesDropdownEnum } from '../../enums/ShowDatesDropdownEnum';
import Colors from '../../constants/Colors';

const TradingHistory: FC = observer(() => {
  const { tabsStore, mainAppStore, historyStore, dateRangeStore } = useStores();

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);

  const fetchPositionsHistory = useCallback(
    async (isScrolling = false, last = false) => {
      const dataStart: string | null = localStorage.getItem(LOCAL_HISTORY_TIME);
      const checkIsNaN = dataStart ? isNaN(moment(dataStart).valueOf()) : true;
      const checkNumber = dataStart ? !parseInt(dataStart) : true;
      try {
        const response = await API.getPositionsHistory({
          accountId: mainAppStore.activeAccountId,
          startDate: moment(
            (checkIsNaN && checkNumber) || !dataStart
              ? dateRangeStore.startDate
              : checkIsNaN
              ? parseInt(dataStart)
              : dataStart
          ).valueOf(),
          endDate: moment().valueOf() + 1000,
          page: isScrolling ? historyStore.positionsHistoryReport.page + 1 : 1,
          pageSize: 20,
        });
        const pagesNow = localStorage.getItem(LOCAL_HISTORY_PAGE);
        if (isScrolling) {
          if (!pagesNow || (!!pagesNow && parseInt(pagesNow) < response.page)) {
            localStorage.setItem(LOCAL_HISTORY_PAGE, `${response.page}`);
          }
        }
        const allPositions: PositionHistoryDTO[] = [
          ...historyStore.positionsHistoryReport.positionsHistory,
          ...response.positionsHistory,
        ];
        const filteredPositions: PositionHistoryDTO[] = [];
        allPositions.forEach((item) => {
          let checkPosition = true;
          filteredPositions.every((position) => {
            if (position.id === item.id) {
              checkPosition = false;
              return false;
            } else {
              return true;
            }
          });
          if (checkPosition) {
            filteredPositions.push(item);
          }
        });
        if (last) {
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
        historyStore.setPositionsHistoryReport({
          ...response,
          positionsHistory: isScrolling
            ? filteredPositions.sort((a, b) => b.closeDate - a.closeDate)
            : response.positionsHistory,
        });
      } catch (error) {}
    },
    [
      mainAppStore.activeAccountId,
      dateRangeStore.startDate,
      dateRangeStore.endDate,
      historyStore.positionsHistoryReport,
    ]
  );

  useEffect(() => {
    let cleanupFunction = false;
    if (
      mainAppStore.activeAccountId &&
      mainAppStore.paramsPortfolioHistory !== undefined
    ) {
      let checkScroll: boolean = false;
      if (mainAppStore.paramsPortfolioHistory) {
        localStorage.removeItem(LOCAL_HISTORY_TIME);
        localStorage.removeItem(LOCAL_HISTORY_POSITION);
        localStorage.removeItem(LOCAL_HISTORY_PAGE);
        localStorage.removeItem(LOCAL_HISTORY_DATERANGE);
      }
      const dataStart: string | null = localStorage.getItem(LOCAL_HISTORY_TIME);
      const neededData: string | null = mainAppStore.paramsPortfolioHistory || localStorage.getItem(
        LOCAL_HISTORY_POSITION
      );
      const neededPage: string | null = localStorage.getItem(
        LOCAL_HISTORY_PAGE
      );
      const neededRange: string | null = localStorage.getItem(
        LOCAL_HISTORY_DATERANGE
      );
      if (neededData) {
        if (neededPage && parseInt(neededPage) > 0) {
          checkScroll = true;
          for (let i = 0; i < parseInt(neededPage) + 1; i++) {
            historyStore.setPositionsHistoryReport({
              ...historyStore.positionsHistoryReport,
              page: i
            });
            fetchPositionsHistory(true, i <= parseInt(neededPage) + 1);
          }
        }
      }
      dateRangeStore.setDropdownValueType(
        neededRange
          ? parseInt(neededRange)
          : ShowDatesDropdownEnum.Week
      );
      dateRangeStore.setStartDate(
        dataStart
          ? moment(dataStart)
          : moment().subtract(1, 'w')
      );
      if (!checkScroll) {
        fetchPositionsHistory().finally(() => {
          if (!cleanupFunction) setIsLoading(false);
        });
      }
    }
    return () => {
      cleanupFunction = true;
      historyStore.setPositionsHistoryReport({
        ...historyStore.positionsHistoryReport,
        page: 1,
        positionsHistory: [],
      });
    };
  }, [
    mainAppStore.activeAccountId,
    mainAppStore.paramsPortfolioHistory
  ]);

  return (
    <PortfolioWrapper flexDirection="column" height="100%">
      <FlexContainer padding="12px 16px" margin="0 0 8px 0">
        <PrimaryTextSpan
          fontSize="12px"
          color={Colors.ACCENT}
          textTransform="uppercase"
        >
          {t('Trading History')}
        </PrimaryTextSpan>
      </FlexContainer>
      <SortByWrapper
        backgroundColor="rgba(65, 66, 83, 0.5)"
        padding="10px 16px"
        alignItems="center"
      >
        <PrimaryTextSpan
          color={Colors.WHITE_LIGHT}
          marginRight="4px"
          fontSize="10px"
          textTransform="uppercase"
        >
          {t('Show')}:
        </PrimaryTextSpan>
        <Observer>
          {() => (
            <FlexContainer height="16px">
              {!tabsStore.isTabExpanded && (
                <DatePickerDropdownNoCustomDates
                  datesChangeCallback={fetchPositionsHistory}
                />
              )}
            </FlexContainer>
          )}
        </Observer>
      </SortByWrapper>
      <Observer>
        {() => (
          <TradingHistoryWrapper flexDirection="column" position="relative">
            <LoaderForComponents isLoading={isLoading} />

            <InfinityScrollList
              getData={fetchPositionsHistory}
              listData={historyStore.positionsHistoryReport.positionsHistory}
              isFetching={isLoading}
              // WATCH CLOSELY
              noMoreData={
                historyStore.positionsHistoryReport.totalItems <=
                historyStore.positionsHistoryReport.page *
                  historyStore.positionsHistoryReport.pageSize
              }
            >
              {historyStore.positionsHistoryReport.positionsHistory.map(
                (item, index) => (
                  <TradingHistoryItem
                    key={item.id}
                    tradingHistoryItem={item}
                    currencySymbol={mainAppStore.activeAccount?.symbol || ''}
                    needScroll={
                      index >=
                      historyStore.positionsHistoryReport.positionsHistory
                        .length -
                        3
                    }
                  />
                )
              )}
            </InfinityScrollList>

            {!historyStore.positionsHistoryReport.positionsHistory.length &&
              !isLoading && (
                <FlexContainer
                  padding="16px"
                  flexDirection="column"
                  alignItems="center"
                >
                  <FlexContainer margin="0 0 20px">
                    <SvgIcon
                      {...IconNoTradingHistory}
                      fillColor="rgba(255, 255, 255, 0.5)"
                    />
                  </FlexContainer>
                  <PrimaryTextSpan
                    color="rgba(255,255,255,0.17)"
                    fontWeight="bold"
                  >
                    {t('There is no trading history')}
                  </PrimaryTextSpan>
                </FlexContainer>
              )}
          </TradingHistoryWrapper>
        )}
      </Observer>
    </PortfolioWrapper>
  );
});

export default TradingHistory;

const PortfolioWrapper = styled(FlexContainer)`
  min-width: 320px;
`;

const TradingHistoryWrapper = styled(FlexContainer)`
  overflow-y: auto;
  height: 100%;
  scroll-behavior: smooth;

  ::-webkit-scrollbar {
    width: 4px;
    border-radius: 2px;
  }

  ::-webkit-scrollbar-track-piece {
    background-color: transparent;
  }
  ::-webkit-scrollbar-thumb:vertical {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

const SortByWrapper = styled(FlexContainer)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
`;
