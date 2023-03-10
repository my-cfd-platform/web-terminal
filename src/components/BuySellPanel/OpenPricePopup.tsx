import React, { useState, useRef, useEffect, FC } from 'react';
import styled from '@emotion/styled';
import { FlexContainer } from '../../styles/FlexContainer';
import IconClose from '../../assets/svg/icon-popup-close.svg';
import { ButtonWithoutStyles } from '../../styles/ButtonWithoutStyles';
import SvgIcon from '../SvgIcon';
import {
  PrimaryTextParagraph,
  PrimaryTextSpan,
} from '../../styles/TextsElements';
import { useStores } from '../../hooks/useStores';
import { Observer, observer } from 'mobx-react-lite';
import Fields from '../../constants/fields';
import { SecondaryButton } from '../../styles/Buttons';
import { useTranslation } from 'react-i18next';
import InformationPopup from '../InformationPopup';
import ErropPopup from '../ErropPopup';
import ColorsPallete from '../../styles/colorPallete';
import { useFormContext } from 'react-hook-form';
import { FormValues } from '../../types/Positions';
import setValueAsNullIfEmpty from '../../helpers/setValueAsNullIfEmpty';
import hasValue from '../../helpers/hasValue';
import Colors from '../../constants/Colors';

interface Props {
  instrumentId: string;
  digits: number;
}

const OpenPricePopup: FC<Props> = observer(({ instrumentId, digits }) => {
  const [on, toggle] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const {
    setValue,
    register,
    errors,
    watch,
    trigger,
    clearErrors
  } = useFormContext<FormValues>();

  const {
    quotesStore,
    instrumentsStore,
    mainAppStore,
    SLTPstore
  } = useStores();

  const handleToggle = () => {
    toggle(!on);
  };

  const handleClickOutside = (e: any) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setValue('openPrice', undefined);
      clearErrors('openPrice');
      toggle(false);
    }
  };

  const applyOpenPrice = (errors: any) => () => {
    trigger('openPrice').then(() => {
      if (!Object.keys(errors).length) {
        toggle(false);
      }
    });
  };

  const handleBeforeInput = (e: any) => {
    clearErrors('openPrice');
    const currTargetValue = e.currentTarget.value;

    if (!e.data.match(/^[0-9.,]*$/g)) {
      e.preventDefault();
      return;
    }

    if (!currTargetValue && [',', '.'].includes(e.data)) {
      e.preventDefault();
      return;
    }

    if ([',', '.'].includes(e.data)) {
      if (
        !currTargetValue ||
        (currTargetValue && currTargetValue.includes('.'))
      ) {
        e.preventDefault();
        return;
      }
    }
    // see another regex
    const regex = `^[0-9]{1,7}([,.][0-9]{1,${
      instrumentsStore.activeInstrument?.instrumentItem.digits || 2
    }})?$`;
    const splittedValue =
      currTargetValue.substring(0, e.currentTarget.selectionStart) +
      e.data +
      currTargetValue.substring(e.currentTarget.selectionStart);
    if (
      currTargetValue &&
      ![',', '.'].includes(e.data) &&
      !splittedValue.match(regex)
    ) {
      e.preventDefault();
      return;
    }
    if (e.data.length > 1 && !splittedValue.match(regex)) {
      e.preventDefault();
      return;
    }
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearErrors('openPrice');
    setValue('openPrice', e.target.value);
  };

  const handleClosePopup = () => {
    setValue('openPrice', undefined);
    clearErrors('openPrice');
    handleToggle();
  };

  const clearOpenPrice = () => {
    setValue('openPrice', null);
  };

  const setCurrentPrice = (value: string) => () => {
    setValue('openPrice', value);
  };

  useEffect(() => {
    if (on) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [on]);

  useEffect(() => {
    if (on && SLTPstore.closeOpenPrice) {
      setValue('openPrice', undefined);
      clearErrors('openPrice');
      handleToggle();
      SLTPstore.toggleCloseOpenPrice(false);
    }
  }, [on, SLTPstore.closeOpenPrice]);

  const { openPrice } = watch();
  return (
    <FlexContainer position="relative" ref={wrapperRef}>
      {hasValue(openPrice) && !on ? (
        <FlexContainer position="relative" width="100%">
          <ButtonAutoClosePurchase
            onClick={handleToggle}
            type="button"
            hasPrice={true}
          >
            <PrimaryTextSpan color={Colors.ACCENT} fontSize="14px">
              {openPrice}
            </PrimaryTextSpan>
          </ButtonAutoClosePurchase>
          <ClearOpenPriceButton type="button" onClick={clearOpenPrice}>
            <SvgIcon
              {...IconClose}
              fillColor={Colors.WHITE_DARK}
              hoverFillColor={Colors.PRIMARY}
            />
          </ClearOpenPriceButton>
        </FlexContainer>
      ) : (
        <ButtonAutoClosePurchase
          onClick={handleToggle}
          type="button"
          hasPrice={false}
        >
          <PrimaryTextSpan color={Colors.ACCENT} fontSize="14px">
            {t('Set Price')}
          </PrimaryTextSpan>
        </ButtonAutoClosePurchase>
      )}
      <SetPriceWrapper
        position="absolute"
        bottom="0px"
        right="100%"
        display={on ? 'flex' : 'none'}
      >
        <Wrapper
          position="relative"
          padding="16px"
          flexDirection="column"
          width="200px"
        >
          <ButtonClose type="button" onClick={handleClosePopup}>
            <SvgIcon
              {...IconClose}
              fillColor={Colors.WHITE_DARK}
              hoverFillColor={Colors.PRIMARY}
            ></SvgIcon>
          </ButtonClose>
          <PrimaryTextParagraph marginBottom="16px">
            {t('Purchase at')}
          </PrimaryTextParagraph>
          <FlexContainer
            margin="0 0 6px 0"
            alignItems="center"
            justifyContent="space-between"
          >
            <PrimaryTextSpan
              fontSize="11px"
              lineHeight="12px"
              color="rgba(255, 255, 255, 0.3)"
              textTransform="uppercase"
            >
              {t('When Price is')}
            </PrimaryTextSpan>
            <InformationPopup
              bgColor="#000000"
              classNameTooltip="autoclose"
              width="212px"
              direction="left"
            >
              <PrimaryTextSpan color={Colors.ACCENT} fontSize="12px">
                {t(
                  'When the position reached the specified take profit or stop loss level, the position will be closed automatically.'
                )}
              </PrimaryTextSpan>
            </InformationPopup>
          </FlexContainer>
          <InputWrapper
            margin="0 0 16px 0"
            height="32px"
            width="100%"
            position="relative"
            justifyContent="space-between"
          >
            {errors.openPrice && (
              <ErropPopup
                textColor={Colors.ACCENT}
                bgColor={ColorsPallete.RAZZMATAZZ}
                classNameTooltip={Fields.OPEN_PRICE}
                direction="left"
              >
                {errors.openPrice.message}
              </ErropPopup>
            )}
            <InputPnL
              onBeforeInput={handleBeforeInput}
              onChange={handleChangeInput}
              name={Fields.OPEN_PRICE}
              placeholder={t('Non Set')}
              ref={register({ setValueAs: setValueAsNullIfEmpty })}
            ></InputPnL>
          </InputWrapper>
          <FlexContainer
            justifyContent="space-between"
            alignItems="center"
            margin="0 0 16px 0"
          >
            <PrimaryTextSpan
              color="rgba(255, 255, 255, 0.3)"
              fontSize="11px"
              lineHeight="12px"
            >
              {t('Current price')}
            </PrimaryTextSpan>
            <Observer>
              {() => (
                <ButtonWithoutStyles
                  type="button"
                  onClick={setCurrentPrice(
                    quotesStore.quotes[instrumentId]?.bid.c.toFixed(digits) ||
                      ''
                  )}
                >
                  <PrimaryTextSpan
                    textDecoration="underline"
                    color="rgba(255, 255, 255, 0.8)"
                    fontSize="11px"
                    lineHeight="12px"
                  >
                    {quotesStore.quotes[instrumentId]?.bid.c.toFixed(digits)}
                  </PrimaryTextSpan>
                </ButtonWithoutStyles>
              )}
            </Observer>
          </FlexContainer>
          <ButtonApply type="button" onClick={applyOpenPrice(errors)}>
            {t('Apply')}
          </ButtonApply>
        </Wrapper>
      </SetPriceWrapper>
    </FlexContainer>
  );
});

export default OpenPricePopup;

const Wrapper = styled(FlexContainer)`
  box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.25),
    0px 6px 12px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 1);
  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
  }
`;

const ButtonClose = styled(ButtonWithoutStyles)`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InputPnL = styled.input`
  background-color: transparent;
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  font-weight: bold;
  font-size: 14px;
  line-height: 16px;
  color: ${Colors.ACCENT};
  padding: 8px 0 8px 8px;

  &:-webkit-input-placeholder {
    color: ${Colors.WHITE};
    opacity: 0.3;
    font-weight: normal;
  }

  &:-ms-input-placeholder {
    color: ${Colors.WHITE};
    opacity: 0.3;
    font-weight: normal;
  }

  &::placeholder {
    color: ${Colors.WHITE};
    opacity: 0.3;
    font-weight: normal;
  }
`;

const InputWrapper = styled(FlexContainer)`
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${Colors.WHITE};
  background-color: rgba(255, 255, 255, 0.06);
`;

const ButtonApply = styled(ButtonWithoutStyles)`
  background-color: ${Colors.PRIMARY};
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  line-height: 16px;
  color: #003a38;
  height: 32px;

  &:hover {
    background-color: ${Colors.PRIMARY_LIGHT};
  }

  &:disabled {
    background-color: rgba(255, 255, 255, 0.04);
    color: white;
  }
`;

const ButtonAutoClosePurchase = styled(SecondaryButton)<{
  hasPrice?: boolean;
}>`
  height: 40px;
  background-color: ${(props) =>
    props.hasPrice ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.12)'};
  width: 100%;
  border: 1px solid
    ${(props) =>
      props.hasPrice ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0)'};

  display: flex;
  justify-content: ${(props) => (props.hasPrice ? 'space-between' : 'center')};
  align-items: center;

  &:active, &:focus {
    background-color: rgba(255, 255, 255, 0.12);
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.24) !important;
  }
`;

const ClearOpenPriceButton = styled(ButtonWithoutStyles)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 12px;
  transition: background-color 0.2s ease;
  will-change: background-color;

  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

const SetPriceWrapper = styled(FlexContainer)`
  top: -96px;
  bottom: auto;
  @media (max-height: 700px) {
    top: auto;
    bottom: 0;
  }
`;
