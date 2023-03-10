import React, { useState, useEffect } from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import {
  PrimaryTextParagraph,
  PrimaryTextSpan,
} from '../../styles/TextsElements';
import styled from '@emotion/styled';

import { useStores } from '../../hooks/useStores';
import AmountPlaceholder from './AmountPlaceholder';
import CurrencyDropdown from './CurrencyDropdown';
import { paymentCurrencies } from '../../constants/paymentCurrencies';
import { PrimaryButton } from '../../styles/Buttons';
import API from '../../helpers/API';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import mixpanel from 'mixpanel-browser';
import mixpanelEvents from '../../constants/mixpanelEvents';
import mixapanelProps from '../../constants/mixpanelProps';
import depositMethod from '../../constants/depositMethod';

import { CreateDirectaInvoiceParams, CreatePayRetailersInvoiceParams } from '../../types/DepositTypes';
import depositResponseMessages from '../../constants/depositResponseMessages';
import { useHistory } from 'react-router-dom';
import { DepositRequestStatusEnum } from '../../enums/DepositRequestStatusEnum';
import PreloaderButtonMask from '../PreloaderButtonMask';
import Page from '../../constants/Pages';
import { getProcessId } from '../../helpers/getProcessId';
import Fields from '../../constants/fields';

const PayRetailers = () => {
  const [currency, setCurrency] = useState(paymentCurrencies[0]);
  const [loading, setLoading] = useState(false);

  const placeholderValues = [250, 500, 1000];

  const { t } = useTranslation();
  const { push } = useHistory();
  const validationSchema = yup.object().shape({
    amount: yup
      .number()
      .min(10, t('min: $10'))
      .max(10000, t('max: $10 000'))
      .required(t('Required field')),
  });

  const initialValues = {
    amount: 500,
  };

  const { mainAppStore, notificationStore, depositFundsStore } = useStores();

  const investOnBeforeInputHandler = (e: any) => {
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
    const regex = /^[0-9]{1,15}([.,][0-9]{1,2})?$/;
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

  const handleSubmitForm = async (values: any) => {
    setLoading(true);
    const paramsFromLocation = new URLSearchParams(location.search);
    const accountIdFromParams = paramsFromLocation.get('accountId')?.slice(0, -1);

    const params: CreatePayRetailersInvoiceParams = {
      ...values,
      amount: +values.amount,
      processId: getProcessId(),
      accountId: accountIdFromParams
        ? accountIdFromParams
        : mainAppStore.accounts.find((acc) => acc.isLive)?.id || '',
    };

    try {
      const result = await API.createPayRetailersInvoice(params);

      switch (result.status) {
        case DepositRequestStatusEnum.Success:
          const hiddenAnchor = document.getElementById('hidden-anchor');
          if (hiddenAnchor) {
            hiddenAnchor.setAttribute('href', result.data.redirectLink);
            hiddenAnchor.click();
          }

          break;

        case DepositRequestStatusEnum.PaymentDeclined:
          // TODO: Refactor
          depositFundsStore.togglePopup();
          push('/?status=failed');
          mixpanel.track(mixpanelEvents.DEPOSIT_FAILED, {
            [mixapanelProps.ERROR_TEXT]: result.status,
          });
          break;

        default:
          notificationStore.setIsSuccessfull(false);
          notificationStore.setNotification(t(
            depositResponseMessages[result.status]
          ));
          notificationStore.openNotification();
          mixpanel.track(mixpanelEvents.DEPOSIT_FAILED, {
            [mixapanelProps.ERROR_TEXT]: result.status,
          });
          break;
      }
      setLoading(false);
    } catch (error) {
      if (mainAppStore.isAuthorized) {
        setLoading(false);
        push(Page.DEPOSIT_POPUP);
      }
    }
  };

  const {
    values,
    setFieldValue,
    validateForm,
    handleSubmit,
    handleChange,
    errors,
    isSubmitting,
    setFieldError
  } = useFormik({
    initialValues,
    onSubmit: handleSubmitForm,
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
  });

  const handleChangeAmount = (e: any) => {
    setFieldError(Fields.AMOUNT, undefined);
    if (e.target.value.length === 19) {
      return;
    }
    e.currentTarget.value = e.currentTarget.value.replace(/,/g, '.');
    handleChange(e);
  };

  const handlerClickSubmit = async () => {
    const curErrors = await validateForm();
    const curErrorsKeys = Object.keys(curErrors);
    if (curErrorsKeys.length) {
      const el = document.getElementById(curErrorsKeys[0]);
      if (el) el.focus();
    }
  };

  useEffect(() => {
    mixpanel.track(mixpanelEvents.DEPOSIT_METHOD_VIEW, {
      [mixapanelProps.DEPOSIT_METHOD]: depositMethod.PAY_RETAILS,
    });
  }, []);

  return (
    <FlexContainer flexDirection="column" padding="32px 0 0 68px" height="100%">
      <CustomForm autoComplete="on" noValidate onSubmit={handleSubmit}>
        <FlexContainer flexDirection="column">
          <FlexContainer flexDirection="column">
            <PrimaryTextParagraph
              textTransform="uppercase"
              fontSize="11px"
              color="rgba(255,255,255,0.3)"
              marginBottom="6px"
            >
              {t('Amount')}
            </PrimaryTextParagraph>

            <FlexContainer
              borderRadius="4px"
              border="1px solid #FFFCCC"
              backgroundColor="#292C33"
              marginBottom="10px"
              maxHeight="48px"
              alignItems="center"
              position="relative"
            >
              <CurrencyDropdown
                disabled={true}
                width="120px"
                handleSelectCurrency={setCurrency}
                selectedCurrency={currency}
              ></CurrencyDropdown>
              <Input
                value={values.amount}
                onChange={handleChangeAmount}
                onBeforeInput={investOnBeforeInputHandler}
                name="amount"
                id="amount"
                autoComplete="off"
              />
              {errors.amount && <ErrorText>{errors.amount}</ErrorText>}
            </FlexContainer>
          </FlexContainer>

          <FlexContainer marginBottom="30px">
            {placeholderValues.map((item) => (
              <AmountPlaceholder
                key={item}
                isActive={parseFloat(item.toString()) === parseFloat(values.amount.toString())}
                value={item}
                currencySymbol={`${mainAppStore.activeAccount?.symbol}`}
                handleClick={() => {
                  setFieldValue('amount', item);
                }}
              />
            ))}
          </FlexContainer>
        </FlexContainer>

        <FlexContainer
          marginBottom="40px"
          position="relative"
          overflow="hidden"
          borderRadius="8px"
        >
          <PreloaderButtonMask loading={loading} />
          <PrimaryButton
            padding="12px 20px"
            width="100%"
            onClick={handlerClickSubmit}
            disabled={isSubmitting}
          >
            <PrimaryTextSpan
              className="notranslate"
              color="#003A38"
              fontSize="14px"
              fontWeight="bold"
              marginRight="5px"
            >
              {t('Deposit')} {mainAppStore.activeAccount?.symbol} (USD)
            </PrimaryTextSpan>
            <PrimaryTextSpan
              className="notranslate"
              color="#003A38"
              fontSize="14px"
              fontWeight="bold"
            >
              {values.amount}
            </PrimaryTextSpan>
          </PrimaryButton>
        </FlexContainer>
      </CustomForm>
    </FlexContainer>
  );
};

export default PayRetailers;

const CustomForm = styled.form`
  margin-bottom: 0;
`;

const Input = styled.input`
  border: none;
  outline: none;
  width: calc(100% - 120px);
  text-align: right;
  height: 48px;
  color: #fffccc;
  font-size: 14px;
  font-weight: bold;
  padding: 24px 16px;
  padding-left: 100px;
  background-color: transparent;
  border-right: 1px solid rgba(255, 255, 255, 0.19);
`;

const ErrorText = styled.span`
  font-weight: bold;
  font-size: 14px;
  line-height: 16px;
  color: #ff557e;
  position: absolute;
  top: 50%;
  right: 95px;
  transform: translateY(-50%);
`;
