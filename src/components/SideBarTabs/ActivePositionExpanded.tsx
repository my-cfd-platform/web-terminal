import React from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import { PositionModelWSDTO } from '../../types/Positions';
import { PrimaryTextSpan, QuoteText } from '../../styles/TextsElements';
import SvgIcon from '../SvgIcon';
import IconShevronDown from '../../assets/svg/icon-shevron-logo-down.svg';
import IconShevronUp from '../../assets/svg/icon-shevron-logo-up.svg';
import { AskBidEnum } from '../../enums/AskBid';
import moment from 'moment';
import { getNumberSign } from '../../helpers/getNumberSign';
import { useStores } from '../../hooks/useStores';
import calculateFloatingProfitAndLoss from '../../helpers/calculateFloatingProfitAndLoss';
import { Observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { ButtonWithoutStyles } from '../../styles/ButtonWithoutStyles';
import InformationPopup from '../InformationPopup';
import API from '../../helpers/API';
import { getProcessId } from '../../helpers/getProcessId';
import { SecondaryButton } from '../../styles/Buttons';

interface Props {
  position: PositionModelWSDTO;
  currencySymbol: string;
}

function ActivePositionExpanded(props: Props) {
  const {
    position: {
      commission,
      id,
      instrument,
      investmentAmount,
      multiplier,
      openDate,
      openPrice,
      operation,
      swap,
      timeStamp,
      stopLossInCurrency,
      stopLossRate,
      takeProfitInCurrency,
      takeProfitRate,
    },
    currencySymbol,
  } = props;
  const { quotesStore, mainAppStore, SLTPStore } = useStores();

  const isBuy = operation === AskBidEnum.Buy;
  const Icon = isBuy ? IconShevronUp : IconShevronDown;

  const PnL = calculateFloatingProfitAndLoss({
    investment: investmentAmount,
    leverage: multiplier,
    costs: swap + commission,
    side: isBuy ? 1 : -1,
    currentPrice: isBuy
      ? quotesStore.quotes[instrument].bid.c
      : quotesStore.quotes[instrument].ask.c,
    openPrice: openPrice,
  });

  const calculateInPercent = (total: number, part: number) => {
    return ((part / total) * 100).toFixed(2);
  };

  const closePosition = () => {
    API.closePosition({
      accountId: mainAppStore.account!.id,
      positionId: id,
      processId: getProcessId(),
    });
  };
  return (
    <DisplayContents>
      <Td>
        <FlexContainer width="32px" height="32px"></FlexContainer>
        <FlexContainer flexDirection="column" margin="0 8px 0 0" width="170px">
          <PrimaryTextSpan fontSize="14px" color="#fffccc" marginBottom="4px">
            {instrument}
          </PrimaryTextSpan>
          <PrimaryTextSpan fontSize="10px" color="rgba(255, 255, 255, 0.4)">
            {instrument}
          </PrimaryTextSpan>
        </FlexContainer>
        <FlexContainer>
          <FlexContainer margin="0 6px 0 0">
            <SvgIcon {...Icon} fillColor={isBuy ? '#00FFDD' : '#ED145B'} />
          </FlexContainer>
          <FlexContainer flexDirection="column">
            <PrimaryTextSpan
              fontSize="14px"
              lineHeight="20px"
              color={isBuy ? '#00FFDD' : '#ED145B'}
              textTransform="uppercase"
              marginBottom="2px"
            >
              {isBuy ? 'Buy' : 'Sell'}
            </PrimaryTextSpan>
            <PrimaryTextSpan
              fontSize="11px"
              color="rgba(255, 255, 255, 0.4)"
              whiteSpace="nowrap"
            >
              at {openPrice}
            </PrimaryTextSpan>
          </FlexContainer>
        </FlexContainer>
      </Td>

      <Td>
        <FlexContainer flexDirection="column">
          <PrimaryTextSpan
            color="#fffccc"
            fontSize="14px"
            lineHeight="20px"
            marginBottom="2px"
          >
            {moment(openDate).format('DD MMM')}
          </PrimaryTextSpan>
          <PrimaryTextSpan color="rgba(255, 255, 255, 0.5)" fontSize="11px">
            {moment(openDate).format('HH:mm:ss')}
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td justifyContent="flex-end">
        <FlexContainer flexDirection="column" alignItems="flex-end">
          <PrimaryTextSpan
            color="#fffccc"
            fontSize="14px"
            lineHeight="20px"
            marginBottom="2px"
          >
            {currencySymbol}
            {investmentAmount}
          </PrimaryTextSpan>
          <PrimaryTextSpan color="rgba(255, 255, 255, 0.5)" fontSize="11px">
            &times;{multiplier}
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td justifyContent="flex-end">
        <FlexContainer flexDirection="column" alignItems="flex-end">
          <Observer>
            {() => (
              <>
                <QuoteText
                  color="#fffccc"
                  fontSize="14px"
                  lineHeight="20px"
                  marginBottom="2px"
                  isGrowth={PnL >= 0}
                >
                  {PnL >= 0 ? '+' : '-'}
                  {currencySymbol}
                  {Math.abs(PnL)}
                </QuoteText>
                <PrimaryTextSpan
                  fontSize="11px"
                  color="rgba(255, 255, 255, 0.4)"
                >
                  {PnL >= 0 ? '+' : ''}
                  {calculateInPercent(investmentAmount, PnL)}%
                </PrimaryTextSpan>
              </>
            )}
          </Observer>
        </FlexContainer>
      </Td>
      <Td justifyContent="flex-end" alignItems="center">
        <FlexContainer flexDirection="column" alignItems="flex-end">
          <Observer>
            {() => (
              <QuoteText isGrowth={PnL + investmentAmount > 0} fontSize="14px">
                {mainAppStore.account?.symbol}
                {(PnL + investmentAmount).toFixed(2)}
              </QuoteText>
            )}
          </Observer>
        </FlexContainer>
      </Td>
      <Td justifyContent="center" alignItems="center">
        <FlexContainer flexDirection="column" alignItems="center">
          <PrimaryTextSpan fontSize="12px" color="#fff">
            Set
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td justifyContent="center" alignItems="center">
        <FlexContainer flexDirection="column" alignItems="center">
          <PrimaryTextSpan fontSize="12px" color="#fff">
            Set
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td alignItems="center">
        <FlexContainer
          flexDirection="column"
          alignItems="center"
          margin="0 16px 0 0"
        >
          <ButtonClose onClick={closePosition}>
            <PrimaryTextSpan fontSize="12px" color="#fff">
              Close
            </PrimaryTextSpan>
          </ButtonClose>
        </FlexContainer>
        <FlexContainer flexDirection="column" alignItems="center">
          <InformationPopup
            classNameTooltip={`position_expaned_${id}`}
            bgColor="#000"
            width="200px"
            direction="left"
          >
            <FlexContainer flexDirection="column" width="100%">
              <FlexContainer justifyContent="space-between" margin="0 0 8px 0">
                <PrimaryTextSpan
                  color="rgba(255, 255, 255, 0.4)"
                  fontSize="12px"
                >
                  Price opened
                </PrimaryTextSpan>
                <PrimaryTextSpan color="#fffccc" fontSize="12px">
                  at {openPrice}
                </PrimaryTextSpan>
              </FlexContainer>
              <FlexContainer justifyContent="space-between" margin="0 0 8px 0">
                <PrimaryTextSpan
                  color="rgba(255, 255, 255, 0.4)"
                  fontSize="12px"
                >
                  Opened
                </PrimaryTextSpan>
                <PrimaryTextSpan color="#fffccc" fontSize="12px">
                  {moment(openDate).format('DD MMM, HH:mm')}
                </PrimaryTextSpan>
              </FlexContainer>
              <FlexContainer justifyContent="space-between" margin="0 0 8px 0">
                <PrimaryTextSpan
                  color="rgba(255, 255, 255, 0.4)"
                  fontSize="12px"
                >
                  Equity
                </PrimaryTextSpan>
                <Observer>
                  {() => (
                    <PrimaryTextSpan color="#fffccc" fontSize="12px">
                      {mainAppStore.account?.symbol}
                      {PnL + investmentAmount}
                    </PrimaryTextSpan>
                  )}
                </Observer>
              </FlexContainer>
              {/* <FlexContainer justifyContent="space-between" margin="0 8px 0 0">
              <PrimaryTextSpan color="rgba(255, 255, 255, 0.4)" fontSize="12px">
               Overnight fee
              </PrimaryTextSpan>
              <PrimaryTextSpan color="#fffccc" fontSize="12px">
                at {openPrice}
              </PrimaryTextSpan>
            </FlexContainer> */}
              <FlexContainer justifyContent="space-between">
                <PrimaryTextSpan
                  color="rgba(255, 255, 255, 0.4)"
                  fontSize="12px"
                >
                  Position ID
                </PrimaryTextSpan>
                <PrimaryTextSpan color="#fffccc" fontSize="12px">
                  {id}
                </PrimaryTextSpan>
              </FlexContainer>
            </FlexContainer>
          </InformationPopup>
        </FlexContainer>
      </Td>
    </DisplayContents>
  );
}

export default ActivePositionExpanded;

const ButtonClose = styled(SecondaryButton)`
  width: 48px;
`;

const Td = styled(FlexContainer)`
  transition: background-color 0.2s ease;
  padding: 12px 0;
  height: 60px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
`;

const DisplayContents = styled.div`
  display: contents;

  &:hover > div {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;