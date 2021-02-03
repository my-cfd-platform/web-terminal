import React, { useState, useRef, useEffect, FC } from 'react';
import styled from '@emotion/styled';
import { FlexContainer } from '../../styles/FlexContainer';
import { ButtonWithoutStyles } from '../../styles/ButtonWithoutStyles';
import {
  PrimaryTextSpan,
  PrimaryTextParagraph,
} from '../../styles/TextsElements';
import { useStores } from '../../hooks/useStores';
import SetAutoclose from './SetAutoclose';
import IconClose from '../../assets/svg/icon-close.svg';
import { SecondaryButton } from '../../styles/Buttons';
import SvgIcon from '../SvgIcon';
import { TpSlTypeEnum } from '../../enums/TpSlTypeEnum';
import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';
import hasValue from '../../helpers/hasValue';
import { ConnectForm } from './ConnectForm';

interface Props {
  isDisabled?: boolean;
}

const AutoClosePopup: FC<Props> = ({}) => {
  const { mainAppStore } = useStores();
  const [on, toggle] = useState(false);
  const { t } = useTranslation();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = (clearErrors: any) => () => {
    toggle(!on);
    if (!on) {
      clearErrors(['tp', 'sl']);
    }
  };

  const handleClickOutside = (e: any) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      handleClose();
    }
  };

  const clearSLTP = (setValue: any) => () => {
    setValue('tp', null);
    setValue('sl', null);
    setValue('slType', null);
    setValue('tpType', null);
  };

  const handleClose = () => {
    toggle(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderTPValue = (getValues: any) => {
    const { tp, tpType } = getValues();
    return `+${
      hasValue(tp)
        ? `${
            tpType === TpSlTypeEnum.Currency
              ? mainAppStore.activeAccount?.symbol
              : ''
          }${tp}`
        : t('Non Set')
    }`;
  };

  const renderSLValue = (getValues: any) => {
    const { sl, slType } = getValues();
    return `—${
      hasValue(sl)
        ? `${
            slType === TpSlTypeEnum.Currency
              ? mainAppStore.activeAccount?.symbol
              : ''
          }${sl}`
        : t('Non Set')
    }`;
  };

  const { sl, tp } = useWatch({});

  return (
    <ConnectForm>
      {({ getValues, clearErrors }) => (
        <>
          <FlexContainer position="relative" ref={wrapperRef}>
            <FlexContainer width="100%" position="relative">
              <ButtonAutoClosePurchase
                onClick={handleToggle(clearErrors)}
                type="button"
                hasValues={!!(sl || tp)}
              >
                <FlexContainer flexDirection="column" alignItems="center">
                  {!on && (hasValue(sl) || hasValue(tp)) ? (
                    <FlexContainer
                      justifyContent="space-between"
                      alignItems="center"
                      padding="0 20px 0 0"
                      width="100%"
                      flexWrap="wrap"
                    >
                      <PrimaryTextSpan
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        title={renderTPValue(getValues)}
                        color="#fffccc"
                        fontSize="14px"
                      >
                        {renderTPValue(getValues)}
                      </PrimaryTextSpan>
                      <PrimaryTextSpan
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        title={renderSLValue(getValues)}
                        color="#fffccc"
                        fontSize="14px"
                      >
                        {renderSLValue(getValues)}
                      </PrimaryTextSpan>
                    </FlexContainer>
                  ) : (
                    <PrimaryTextParagraph color="#fffccc" fontSize="14px">
                      {t('Set')}
                    </PrimaryTextParagraph>
                  )}
                </FlexContainer>
              </ButtonAutoClosePurchase>
              {!on && (hasValue(sl) || hasValue(tp)) && (
                <ClearSLTPButton type="button" onClick={clearSLTP}>
                  <SvgIcon
                    {...IconClose}
                    fillColor="rgba(255,255,255,0.4)"
                    hoverFillColor="#00FFDD"
                  />
                </ClearSLTPButton>
              )}
            </FlexContainer>
            <FlexContainer
              position="absolute"
              top="20px"
              right="100%"
              visibility={on ? 'visible' : 'hidden'}
            >
              <SetAutoclose toggle={toggle} />
            </FlexContainer>
          </FlexContainer>
        </>
      )}
    </ConnectForm>
  );
};

export default AutoClosePopup;

const ButtonAutoClosePurchase = styled(SecondaryButton)<{
  hasValues?: boolean;
}>`
  height: 40px;
  width: 100%;
  margin-bottom: 14px;
  text-align: ${(props) => props.hasValues && 'left'};
  border: ${(props) => props.hasValues && '1px solid rgba(255, 255, 255, 0.1)'};
  background-color: ${(props) =>
    props.hasValues && 'rgba(255, 255, 255, 0.06)'};
`;

const ClearSLTPButton = styled(ButtonWithoutStyles)`
  position: absolute;
  top: 12px;
  right: 12px;
`;
