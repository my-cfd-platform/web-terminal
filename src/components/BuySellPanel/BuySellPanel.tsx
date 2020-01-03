import React from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import styled from '@emotion/styled';
import MaskedInput from 'react-text-mask';
import { ButtonWithoutStyles } from '../../styles/ButtonWithoutStyles';
import SvgIcon from '../SvgIcon';
import IconShevronBuy from '../../assets/svg/icon-buy-sell-shevron-buy.svg';
import IconShevronSell from '../../assets/svg/icon-buy-sell-shevron-sell.svg';
import Toggle from '../Toggle';
import AutoClosePopup from './AutoClosePopup';
import PurchaseAtPopup from './PurchaseAtPopup';
import * as yup from 'yup';
import { v4 } from 'uuid';
import {
  OpenPositionModel,
  OpenPositionModelFormik,
} from '../../types/Positions';
import { InstrumentModelWSDTO } from '../../types/Instruments';
import { AskBidEnum } from '../../enums/AskBid';
import API from '../../helpers/API';
import NotificationTooltip from '../NotificationTooltip';
import { PrimaryTextSpan } from '../../styles/TextsElements';
import { Formik, Field, FieldProps, ErrorMessage, Form } from 'formik';
import Fields from '../../constants/fields';
import { useStores } from '../../hooks/useStores';
import ColorsPallete from '../../styles/colorPallete';
import ErropPopup from '../ErropPopup';
import MultiplierDropdown from './MultiplierDropdown';
import InvestAmountDropdown from './InvestAmountDropdown';

interface Props {
  currencySymbol: string;
  accountId: OpenPositionModel['accountId'];
  instrument: InstrumentModelWSDTO;
  digits: number;
}

interface OpenModel {
  sl: OpenPositionModel['sl'];
  tp: OpenPositionModel['tp'];
  slRate: OpenPositionModel['slRate'];
  tpRate: OpenPositionModel['tpRate'];
  investmentAmount: OpenPositionModel['investmentAmount'];
  multiplier: OpenPositionModel['multiplier'];
}

function BuySellPanel(props: Props) {
  const { currencySymbol, accountId, instrument, digits } = props;

  const initialValues: OpenPositionModelFormik = {
    processId: v4(),
    accountId,
    instrumentId: instrument.id,
    operation: AskBidEnum.Buy,
    multiplier: instrument.multiplier[0],
    investmentAmount: '',
  };

  const validationSchema = yup.object().shape<OpenModel>({
    investmentAmount: yup
      .number()
      .min(
        instrument.minOperationVolume / initialValues.multiplier,
        'minOperationVolume'
      )
      .max(
        instrument.maxOperationVolume / initialValues.multiplier,
        'maxOperationVolume'
      )
      .required('Required amount'),
    multiplier: yup.number().required('Required amount'),
    tp: yup.number(),
    tpRate: yup.number(),
    sl: yup.number(),
    slRate: yup.number(),
  });

  const handleOpenPosition = (
    submitForm: () => Promise<void>,
    operation: AskBidEnum,
    setFieldValue: any
  ) => () => {
    setFieldValue(Fields.OPERATION, operation);
    submitForm();
  };

  const handleSubmit = (values: OpenPositionModelFormik, actions: any) => {
    actions.setSubmitting(false);

    API.openPosition({
      ...values,
      investmentAmount: +values.investmentAmount,
    });
  };

  const { quotesStore } = useStores();

  const calculateVolume = (values: OpenPositionModelFormik) => {
    return +values.investmentAmount;
  };

  const calculateSpread = () => {
    return Math.abs(
      quotesStore.quotes[instrument.id].bid.c -
        quotesStore.quotes[instrument.id].ask.c
    ).toFixed(digits);
  };

  const handleChangeInputAmount = (
    setFieldValue: any,
    value: any,
    increase = false
  ) => () => {
    setFieldValue(Fields.AMOUNT, increase ? +value + 1 : +value - 1);
  };

  return (
    <FlexContainer padding="16px" flexDirection="column">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        enableReinitialize
      >
        {({ isSubmitting, isValid, setFieldValue, values, submitForm }) => (
          <CustomForm>
            <FlexContainer
              justifyContent="space-between"
              flexWrap="wrap"
              margin="0 0 4px 0"
            >
              <PrimaryTextSpan
                fontSize="11px"
                lineHeight="12px"
                textTransform="uppercase"
                opacity="0.3"
              >
                Invest
              </PrimaryTextSpan>
              <InfoIcon
                justifyContent="center"
                alignItems="center"
                width="14px"
                height="14px"
              >
                i
              </InfoIcon>
            </FlexContainer>
            <Field type="text" name={Fields.AMOUNT}>
              {({ field, meta }: FieldProps) => (
                <InvestedAmoutInputWrapper
                  padding="0 0 0 4px"
                  margin="0 0 14px 0"
                  position="relative"
                  alignItems="center"
                  zIndex="100"
                >
                  {meta.touched && meta.error && (
                    <ErropPopup
                      textColor="#fffccc"
                      bgColor={ColorsPallete.RAZZMATAZZ}
                      classNameTooltip={Fields.AMOUNT}
                    >
                      This value is higher or lower than the one currently
                      allowed
                    </ErropPopup>
                  )}
                  <PrimaryTextSpan fontWeight="bold" marginRight="2px">
                    {currencySymbol}
                  </PrimaryTextSpan>

                  <FlexContainer alignItems="center">
                    <MaskedInput
                      {...field}
                      mask={[/\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
                      showMask={true}
                      guide={false}
                      render={(ref, props) => (
                        <>
                          <InvestInput ref={ref} {...props} />
                          <InvestAmountDropdown
                            setFieldValue={setFieldValue}
                            symbol={currencySymbol}
                          />
                        </>
                      )}
                    ></MaskedInput>
                    <PlusMinusButtonWrapper flexDirection="column">
                      <PlusButton
                        onClick={handleChangeInputAmount(
                          setFieldValue,
                          values.investmentAmount,
                          true
                        )}
                      >
                        <PrimaryTextSpan fontWeight="bold">+</PrimaryTextSpan>
                      </PlusButton>
                      <MinusButton
                        onClick={handleChangeInputAmount(
                          setFieldValue,
                          values.investmentAmount
                        )}
                      >
                        <PrimaryTextSpan fontWeight="bold">-</PrimaryTextSpan>
                      </MinusButton>
                    </PlusMinusButtonWrapper>
                  </FlexContainer>
                </InvestedAmoutInputWrapper>
              )}
            </Field>

            <FlexContainer
              justifyContent="space-between"
              flexWrap="wrap"
              margin="0 0 4px 0"
            >
              <PrimaryTextSpan
                fontSize="11px"
                lineHeight="12px"
                textTransform="uppercase"
                opacity="0.3"
              >
                Leverage
              </PrimaryTextSpan>
              <NotificationTooltip
                bgColor="#000000"
                textColor="#fff"
                classNameTooltip="leverage"
              >
                The amount you’d like to invest
              </NotificationTooltip>
            </FlexContainer>
            <MultiplierDropdown
              multipliers={instrument.multiplier}
              selectedMultiplier={values.multiplier}
              setFieldValue={setFieldValue}
            ></MultiplierDropdown>
            <FlexContainer
              justifyContent="space-between"
              flexWrap="wrap"
              margin="0 0 4px 0"
            >
              <PrimaryTextSpan
                fontSize="11px"
                lineHeight="12px"
                textTransform="uppercase"
                opacity="0.3"
              >
                Autoclose
              </PrimaryTextSpan>
              <InfoIcon
                justifyContent="center"
                alignItems="center"
                width="14px"
                height="14px"
              >
                i
              </InfoIcon>
            </FlexContainer>
            <FlexContainer position="relative">
              <Toggle>
                {({ on, toggle }) => (
                  <>
                    <ButtonAutoClosePurchase onClick={toggle} type="button">
                      {values.sl || values.slRate || values.tp || values.tpRate
                        ? `+${currencySymbol}${values.tp ||
                            values.tpRate ||
                            'Non Set'} -${currencySymbol}${values.sl ||
                            values.slRate ||
                            'Non Set'}`
                        : 'Set'}
                    </ButtonAutoClosePurchase>
                    {on && (
                      <FlexContainer
                        position="absolute"
                        top="20px"
                        right="100%"
                      >
                        <AutoClosePopup
                          toggle={toggle}
                          setFieldValue={setFieldValue}
                          values={values}
                        ></AutoClosePopup>
                      </FlexContainer>
                    )}
                  </>
                )}
              </Toggle>
            </FlexContainer>

            <FlexContainer justifyContent="space-between" margin="0 0 8px 0">
              <PrimaryTextSpan
                fontSize="11px"
                lineHeight="12px"
                textTransform="uppercase"
                opacity="0.3"
              >
                VOLUME
              </PrimaryTextSpan>
              <ValueText>
                {currencySymbol}
                {calculateVolume(values)}
              </ValueText>
            </FlexContainer>
            <FlexContainer justifyContent="space-between" margin="0 0 16px 0">
              <PrimaryTextSpan
                fontSize="11px"
                lineHeight="12px"
                textTransform="uppercase"
                opacity="0.3"
              >
                Spread
              </PrimaryTextSpan>
              <ValueText>
                {currencySymbol}
                {calculateSpread()}
              </ValueText>
            </FlexContainer>
            <FlexContainer flexDirection="column">
              <ButtonBuy
                type="button"
                disabled={!isValid || isSubmitting}
                onClick={handleOpenPosition(
                  submitForm,
                  AskBidEnum.Buy,
                  setFieldValue
                )}
              >
                <FlexContainer margin="0 8px 0 0">
                  <SvgIcon {...IconShevronBuy} fill="#003A38"></SvgIcon>
                </FlexContainer>
                Buy
              </ButtonBuy>
              <ButtonSell type="button" disabled={!isValid || isSubmitting}>
                <FlexContainer margin="0 8px 0 0">
                  <SvgIcon {...IconShevronSell} fill="#fff"></SvgIcon>
                </FlexContainer>
                Sell
              </ButtonSell>
            </FlexContainer>
            <FlexContainer
              justifyContent="space-between"
              flexWrap="wrap"
              margin="0 0 4px 0"
            >
              <PrimaryTextSpan
                fontSize="11px"
                lineHeight="12px"
                textTransform="uppercase"
                opacity="0.3"
              >
                Purchase at
              </PrimaryTextSpan>
              <InfoIcon
                justifyContent="center"
                alignItems="center"
                width="14px"
                height="14px"
              >
                i
              </InfoIcon>
            </FlexContainer>
            <FlexContainer position="relative">
              <Toggle>
                {({ on, toggle }) => (
                  <>
                    <ButtonAutoClosePurchase onClick={toggle} type="button">
                      Set
                    </ButtonAutoClosePurchase>
                    {on && (
                      <FlexContainer
                        position="absolute"
                        top="20px"
                        right="100%"
                      >
                        <PurchaseAtPopup
                          toggle={toggle}
                          setFieldValue={setFieldValue}
                          // @ts-ignore
                          purchaseAtValue={values.purchaseAt}
                          instrumentId={instrument.id}
                        ></PurchaseAtPopup>
                      </FlexContainer>
                    )}
                  </>
                )}
              </Toggle>
            </FlexContainer>
          </CustomForm>
        )}
      </Formik>
    </FlexContainer>
  );
}

export default BuySellPanel;

const ButtonAutoClosePurchase = styled(ButtonWithoutStyles)`
  height: 40px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  width: 100%;
  font-size: 14px;
  line-height: 24px;
  color: #ffffff;
  margin-bottom: 14px;
`;

const InvestInput = styled.input`
  height: 100%;
  width: 100%;
  outline: none;
  border: none;
  background-color: transparent;
  font-weight: bold;
  font-size: 14px;
  line-height: 16px;
  color: #ffffff;

  &:focus + .investAmountDropdown {
    opacity: 1;
    visibility: visible;
  }
`;

const InfoIcon = styled(FlexContainer)`
  font-size: 11px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fffccc;
  font-style: italic;
`;

const ValueText = styled.span`
  font-family: Roboto;
  font-size: 12px;
  line-height: 14px;
  color: #ffffff;
`;

const ButtonSell = styled(ButtonWithoutStyles)`
  background: linear-gradient(0deg, #ed145b, #ed145b);
  border-radius: 4px;
  height: 56px;
  color: #fff;
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
`;

const ButtonBuy = styled(ButtonSell)`
  background: linear-gradient(0deg, #00fff2, #00fff2);
  box-shadow: 0px 4px 8px rgba(0, 255, 242, 0.17),
    inset 0px -3px 6px rgba(0, 255, 242, 0.26);
  color: #003a38;
  margin-bottom: 8px;
`;

const CustomForm = styled(Form)`
  margin: 0;
`;

const InvestedAmoutInputWrapper = styled(FlexContainer)`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.06);
    z-index: -1;
  }

  &:focus-within {
    border: 1px solid #21b3a4;
  }
`;

const MinusButton = styled(ButtonWithoutStyles)`
  display: flex;
  padding: 2px 4px;
  justify-content: center;
  align-items: center;
`;

const PlusButton = styled(MinusButton)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const PlusMinusButtonWrapper = styled(FlexContainer)`
  border-left: 1px solid rgba(255, 255, 255, 0.1);
`;