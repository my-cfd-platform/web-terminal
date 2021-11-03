import React, { useCallback, useRef } from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import { PrimaryTextSpan } from '../../styles/TextsElements';
import SvgIcon from '../SvgIcon';
import IconShevronDown from '../../assets/svg/icon-shevron-logo-down.svg';
import IconShevronUp from '../../assets/svg/icon-shevron-logo-up.svg';
import { AskBidEnum } from '../../enums/AskBid';
import moment from 'moment';
import { useStores } from '../../hooks/useStores';
import styled from '@emotion/styled';
import InformationPopup from '../InformationPopup';
import API from '../../helpers/API';
import { getProcessId } from '../../helpers/getProcessId';
import { SecondaryButton } from '../../styles/Buttons';
import { DisplayContents, Td } from '../../styles/TableElements';
import { PendingOrderWSDTO } from '../../types/PendingOrdersTypes';
import ImageContainer from '../ImageContainer';
import { TpSlTypeEnum } from '../../enums/TpSlTypeEnum';
import ClosePositionPopup from './ClosePositionPopup';
import { useTranslation } from 'react-i18next';
import useInstrumentPrecision from '../../hooks/useInstrumentPrecision';

interface Props {
  position: PendingOrderWSDTO;
  currencySymbol: string;
}

function OrderExpandedItem(props: Props) {
  const {
    position: {
      id,
      instrument,
      investmentAmount,
      multiplier,
      openPrice,
      operation,
      created,
      tp,
      sl,
      slType,
      tpType,
    },
    currencySymbol,
  } = props;
  const { mainAppStore, instrumentsStore } = useStores();
  const instrumentRef = useRef<HTMLDivElement>(null);

  const { precision } = useInstrumentPrecision(instrument);
  const isBuy = operation === AskBidEnum.Buy;
  const Icon = isBuy ? IconShevronUp : IconShevronDown;

  const positionInstrument = useCallback(() => {
    return instrumentsStore.instruments.find(
      (item) => item.instrumentItem.id === instrument
    )?.instrumentItem;
  }, [props.position]);

  const closePosition = () => {
    API.removePendingOrder({
      accountId: mainAppStore.activeAccount!.id,
      orderId: id,
      processId: getProcessId(),
    });
  };

  const { t } = useTranslation();

  return (
    <DisplayContents>
      <Td>
        <FlexContainer width="32px" height="32px" marginRight="8px">
          <ImageContainer instrumentId={instrument} />
        </FlexContainer>
        <FlexContainer flexDirection="column" margin="0 8px 0 0" width="170px">
          <PrimaryTextSpan fontSize="14px" color="#fffccc" marginBottom="4px">
            {positionInstrument()?.name}
          </PrimaryTextSpan>
          <PrimaryTextSpan fontSize="10px" color="rgba(255, 255, 255, 0.4)">
            {instrument}
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td>
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
              {isBuy ? t('Buy') : t('Sell')}
            </PrimaryTextSpan>
            <PrimaryTextSpan
              fontSize="11px"
              color="rgba(255, 255, 255, 0.4)"
              whiteSpace="nowrap"
            >
              {t('at')} {openPrice.toFixed(+precision)}
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
            {moment(created).format('DD MMM')}
          </PrimaryTextSpan>
          <PrimaryTextSpan color="rgba(255, 255, 255, 0.5)" fontSize="11px">
            {moment(created).format('HH:mm:ss')}
          </PrimaryTextSpan>
        </FlexContainer>
      </Td>
      <Td alignItems="center" flexDirection="column">
        <PrimaryTextSpan
          color="#fffccc"
          fontSize="14px"
          lineHeight="20px"
          marginBottom="2px"
        >
          {currencySymbol}
          {investmentAmount.toFixed(2)}
        </PrimaryTextSpan>
        <PrimaryTextSpan color="rgba(255, 255, 255, 0.5)" fontSize="11px">
          &times;{multiplier}
        </PrimaryTextSpan>
      </Td>
      <Td justifyContent="center" alignItems="center">
        <PrimaryTextSpan color="rgba(255, 255, 255, 0.5)" fontSize="11px">
          {tp !== null ? (
            <>
              {tpType !== TpSlTypeEnum.Price && tp < 0 && '-'}
              {tpType !== TpSlTypeEnum.Price && currencySymbol}
              {tpType === TpSlTypeEnum.Price
                ? Math.abs(tp)
                : Math.abs(tp).toFixed(2)}
            </>
          ) : (
            '-'
          )}
        </PrimaryTextSpan>
      </Td>
      <Td justifyContent="center" alignItems="center">
        <PrimaryTextSpan color="rgba(255, 255, 255, 0.5)" fontSize="11px">
          {sl !== null ? (
            <>
              {slType !== TpSlTypeEnum.Price && sl < 0 && '-'}
              {slType !== TpSlTypeEnum.Price && currencySymbol}
              {slType === TpSlTypeEnum.Price
                ? Math.abs(sl)
                : Math.abs(sl).toFixed(2)}
            </>
          ) : (
            '-'
          )}
        </PrimaryTextSpan>
      </Td>
      <Td alignItems="center" justifyContent="center">
        <FlexContainer
          flexDirection="column"
          alignItems="center"
          margin="0 18px 0 0"
          position="relative"
        >
          <ClosePositionPopup
            buttonLabel={t('Cancel order')}
            applyHandler={closePosition}
            ref={instrumentRef}
            confirmText={`${t('Cancel order')}?`}
            isButton
            alignPopup="right"
          />
        </FlexContainer>
        <FlexContainer flexDirection="column" alignItems="center">
          <InformationPopup
            classNameTooltip={`position_expaned_${id}`}
            bgColor="#000"
            width="250px"
            direction="left"
          >
            <FlexContainer flexDirection="column" width="100%">
              <FlexContainer justifyContent="space-between" margin="0 0 8px 0">
                <PrimaryTextSpan
                  color="rgba(255, 255, 255, 0.4)"
                  fontSize="12px"
                >
                  {t('Price opened')}
                </PrimaryTextSpan>
                <PrimaryTextSpan color="#fffccc" fontSize="12px">
                  {t('at')} {openPrice.toFixed(+precision)}
                </PrimaryTextSpan>
              </FlexContainer>
              <FlexContainer justifyContent="space-between" margin="0 0 8px 0">
                <PrimaryTextSpan
                  color="rgba(255, 255, 255, 0.4)"
                  fontSize="12px"
                >
                  {t('Created')}
                </PrimaryTextSpan>
                <PrimaryTextSpan color="#fffccc" fontSize="12px">
                  {moment(created).format('DD MMM, HH:mm:ss')}
                </PrimaryTextSpan>
              </FlexContainer>
              <FlexContainer justifyContent="space-between">
                <PrimaryTextSpan
                  color="rgba(255, 255, 255, 0.4)"
                  fontSize="12px"
                >
                  {t('Position ID')}
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

export default OrderExpandedItem;
