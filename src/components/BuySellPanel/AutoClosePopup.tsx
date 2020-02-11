import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { FlexContainer } from '../../styles/FlexContainer';
import { ButtonWithoutStyles } from '../../styles/ButtonWithoutStyles';
import { PrimaryTextSpan } from '../../styles/TextsElements';
import Fields from '../../constants/fields';
import { OpenPositionModelFormik } from '../../types/Positions';
import { useStores } from '../../hooks/useStores';
import SetAutoclose from './SetAutoclose';
import IconClose from '../../assets/svg/icon-close.svg';
import { SecondaryButton } from '../../styles/Buttons';
import SvgIcon from '../SvgIcon';

interface Props {
  setFieldValue: (field: any, value: any) => void;
  values: OpenPositionModelFormik;
  currencySymbol: string;
}

function AutoClosePopup(props: Props) {
  const { setFieldValue, values, currencySymbol } = props;
  const { SLTPStore } = useStores();
  const [on, toggle] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const handleToggle = () => {
    toggle(!on);
  };

  const handleApply = () => {
    setFieldValue(Fields.TAKE_PROFIT, SLTPStore.takeProfitValue);
    setFieldValue(Fields.STOP_LOSS, SLTPStore.stopLossValue);
  };

  const handleClickOutside = (e: any) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      toggle(false);
    }
  };

  const clearSLTP = () => {
    setFieldValue(Fields.TAKE_PROFIT, null);
    setFieldValue(Fields.STOP_LOSS, null);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <FlexContainer position="relative" ref={wrapperRef}>
      <FlexContainer width="100%" position="relative">
        <ButtonAutoClosePurchase
          onClick={handleToggle}
          type="button"
          hasValues={!!(values.sl || values.tp)}
        >
          <PrimaryTextSpan color="#fffccc">
            {values.sl || values.tp
              ? `${`+${currencySymbol}${values.tp}` ||
                  'Non Set'} —${currencySymbol + values.sl || 'Non Set'}`
              : 'Set'}
          </PrimaryTextSpan>
        </ButtonAutoClosePurchase>
        {!!(values.sl || values.tp) && (
          <ClearSLTPButton type="button" onClick={clearSLTP}>
            <SvgIcon
              {...IconClose}
              fillColor="rgba(255,255,255,0.4)"
              hoverFillColor="#00FFDD"
            />
          </ClearSLTPButton>
        )}
      </FlexContainer>
      {on && (
        <FlexContainer position="absolute" top="20px" right="100%">
          <SetAutoclose
            handleApply={handleApply}
            stopLossValue={values.sl}
            takeProfitValue={values.tp}
            toggle={toggle}
            investedAmount={+values.investmentAmount}
          />
        </FlexContainer>
      )}
    </FlexContainer>
  );
}

export default AutoClosePopup;

const ButtonAutoClosePurchase = styled(SecondaryButton)<{
  hasValues?: boolean;
}>`
  height: 40px;
  width: 100%;
  margin-bottom: 14px;
  text-align: ${props => props.hasValues && 'left'};
`;

const ClearSLTPButton = styled(ButtonWithoutStyles)`
  position: absolute;
  top: 12px;
  right: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
`;
