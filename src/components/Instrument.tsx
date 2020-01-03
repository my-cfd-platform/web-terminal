import React, { useEffect, FC } from 'react';
import { FlexContainer } from '../styles/FlexContainer';
import { InstrumentModelWSDTO } from '../types/Instruments';
import Topics from '../constants/websocketTopics';
import { ResponseFromWebsocket } from '../types/ResponseFromWebsocket';
import { BidAskModelWSDTO } from '../types/BidAsk';
import IconClose from '../assets/svg/icon-instrument-close.svg';
import { ButtonWithoutStyles } from '../styles/ButtonWithoutStyles';
import SvgIcon from './SvgIcon';
import styled from '@emotion/styled';
import { useStores } from '../hooks/useStores';
import { observer, Observer } from 'mobx-react-lite';
import { PrimaryTextSpan, QuoteText } from '../styles/TextsElements';
import calculateGrowth from '../helpers/calculateGrowth';
import { AskBidEnum } from '../enums/AskBid';

interface Props {
  switchInstrument: () => void;
  instrument: InstrumentModelWSDTO;
  isActive?: boolean;
  handleClose: () => void;
}

const Instrument: FC<Props> = ({
  instrument,
  switchInstrument,
  isActive,
  handleClose,
}) => {
  const { quotesStore, mainAppStore } = useStores();

  useEffect(() => {
    mainAppStore.activeSession?.on(
      Topics.BID_ASK,
      (response: ResponseFromWebsocket<BidAskModelWSDTO[]>) => {
        if (!response.data.length) {
          return;
        }
        response.data.forEach(item => {
          quotesStore.setQuote(item);
        });
      }
    );
  }, [instrument]);

  return (
    <QuotesFeedWrapper
      isActive={isActive}
      padding="6px 0 6px 8px"
      onClick={switchInstrument}
      width="128px"
      height="40px"
      alignItems="center"
      justifyContent="space-between"
    >
      <FlexContainer
        height="24px"
        width="24px"
        position="relative"
        margin="0 6px 0 0"
      ></FlexContainer>
      {quotesStore.quotes[instrument.id] && (
        <Observer>
          {() => (
            <FlexContainer margin="0 8px 0 0" flexDirection="column">
              <PrimaryTextSpan fontSize="12px">
                {instrument.name}
              </PrimaryTextSpan>
              <QuoteText
                fontSize="11px"
                lineHeight="14px"
                isGrowth={
                  quotesStore.quotes[instrument.id].dir === AskBidEnum.Buy
                }
              >
                {calculateGrowth(
                  quotesStore.quotes[instrument.id].bid.c,
                  quotesStore.quotes[instrument.id].ask.c,
                  mainAppStore.account?.digits
                )}
              </QuoteText>
            </FlexContainer>
          )}
        </Observer>
      )}
      <SmallBorderToCloseIcon padding="0 8px 0 0" isActive={isActive}>
        <ButtonWithoutStyles onClick={handleClose}>
          <SvgIcon {...IconClose} fill="rgba(255, 255, 255, 0.6)"></SvgIcon>
        </ButtonWithoutStyles>
      </SmallBorderToCloseIcon>
    </QuotesFeedWrapper>
  );
};

export default Instrument;

const QuotesFeedWrapper = styled(FlexContainer)<{ isActive?: boolean }>`
  position: relative;
  align-items: center;
  box-shadow: ${props =>
    props.isActive ? 'inset 0px 1px 0px #00ffdd' : 'none'};
  border-radius: 0px 0px 3px 3px;
  overflow: hidden;
  transition: box-shadow 0.2s ease, background-color 0.2s ease;

  &:before {
    content: '';
    transition: background-color 0.2s ease;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props =>
      props.isActive
        ? 'radial-gradient(50.41% 50% at 50% 0%, rgba(0, 255, 221, 0.08) 0%, rgba(0, 255, 221, 0) 100%), rgba(255, 255, 255, 0.04)'
        : 'none'};
  }

  &:hover {
    cursor: pointer;

    &:before {
      background-color: ${props =>
        !props.isActive && 'rgba(255, 255, 255, 0.08)'};
    }
  }
`;

const SmallBorderToCloseIcon = styled(FlexContainer)<{ isActive?: boolean }>`
  /* border-right: ${props =>
    props.isActive ? 'none' : '1px solid rgba(0, 0, 0, 0.2)'}; */
`;