import React, { useCallback } from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import styled from '@emotion/styled';
import { FlexContainer } from '../../../styles/FlexContainer';
import { PrimaryTextSpan } from '../../../styles/TextsElements';
import { useStores } from '../../../hooks/useStores';
import { WithdrawalTypesEnum } from '../../../enums/WithdrawalTypesEnum';
import { CreateWithdrawalParams } from '../../../types/WithdrawalTypes';
import API from '../../../helpers/API';
import { PrimaryButton } from '../../../styles/Buttons';
import { WithdrawalHistoryResponseStatus } from '../../../enums/WithdrawalHistoryResponseStatus';
import { WithdrawalTabsEnum } from '../../../enums/WithdrawalTabsEnum';

interface RequestValues {
  amount: number;
  bitcoinAdress: string;
}
const VALIDATE_BITCOIN = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

const WithdrawFormBitcoin = () => {
  const initialValues: RequestValues = {
    amount: 0,
    bitcoinAdress: '',
  };

  const { mainAppStore, withdrawalStore } = useStores();

  const validationSchema = useCallback(
    () =>
      yup.object().shape<RequestValues>({
        amount: yup
          .number()
          .min(10, 'min: $10')
          .max(
            mainAppStore.accounts.find(item => item.isLive)?.balance || 0,
            `max: ${mainAppStore.accounts.find(item => item.isLive)?.balance ||
              0}`
          ),

        bitcoinAdress: yup
          .string()
          .min(26, 'Incorrect Bitcoin address')
          .max(35, 'Incorrect Bitcoin address')
          .matches(VALIDATE_BITCOIN, 'Incorrect Bitcoin address')
          .required('Incorrect Bitcoin address'),
      }),
    [mainAppStore.accounts]
  );

  const handleSubmitForm = async () => {
    const accountInfo = mainAppStore.accounts.find(item => item.isLive);
    try {
      const dataParam = {
        amount: +values.amount,
        bitcoinAdress: values.bitcoinAdress,
      };
      const data: CreateWithdrawalParams = {
        authToken: mainAppStore.token,
        accountId: accountInfo?.id || '',
        currency: accountInfo?.currency || '',
        amount: +values.amount,
        withdrawalType: WithdrawalTypesEnum.Bitcoin,
        data: JSON.stringify(dataParam),
      };

      const result = await API.createWithdrawal(data);
      if (result.status === WithdrawalHistoryResponseStatus.Successful) {
        withdrawalStore.opentTab(WithdrawalTabsEnum.History);
      }
      if (
        result.status ===
        WithdrawalHistoryResponseStatus.WithdrawalRequestAlreadyCreated
      ) {
        withdrawalStore.setPendingPopup();
      }
    } catch (error) {}
  };

  const {
    values,
    setFieldError,
    setFieldValue,
    validateForm,
    handleChange,
    handleSubmit,
    errors,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues,
    onSubmit: handleSubmitForm,
    validationSchema,
    validateOnBlur: false,
    validateOnChange: true,
  });

  const handleChangeAmount = (e: any) => {
    let filteredValue: any = e.target.value.replace(',', '.');
    setFieldValue('amount', filteredValue);
  };

  const handleBlurAmount = () => {
    let amount = values.amount.toString().replace(/,/g, '');
    amount = parseFloat(amount || '0')
      .toLocaleString('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })
      .replace(/,/g, '');
    setFieldValue('amount', amount);
  };
  const amountOnBeforeInputHandler = (e: any) => {
    const currTargetValue = e.currentTarget.value;
    if (!e.data.match(/^[0-9.,]*$/g)) {
      e.preventDefault();
      return;
    }
  };

  const handlerClickSubmit = async () => {
    const curErrors = await validateForm();
    const curErrorsKeys = Object.keys(curErrors);
    if (curErrorsKeys.length) {
      const el = document.getElementById(curErrorsKeys[0]);
      if (el) el.focus();
    }
  };
  return (
    <CustomForm noValidate onSubmit={handleSubmit}>
      <FlexContainer flexDirection="column" width="340px">
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
            Amount
          </PrimaryTextSpan>
        </FlexContainer>

        <InputWrapper
          margin="0 0 16px 0"
          height="32px"
          width="100%"
          position="relative"
          justifyContent="space-between"
        >
          <InputField
            name="amount"
            id="amount"
            onBeforeInput={amountOnBeforeInputHandler}
            onChange={handleChangeAmount}
            onBlur={handleBlurAmount}
            value={values.amount || ''}
            type="text"
          />

          {touched.amount && errors.amount && (
            <ErrorText>{errors.amount}</ErrorText>
          )}
        </InputWrapper>

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
            Bitcoin adress
          </PrimaryTextSpan>
        </FlexContainer>

        <InputWrapper
          margin="0 0 0 0"
          height="32px"
          width="100%"
          position="relative"
          justifyContent="space-between"
        >
          <InputField
            name="bitcoinAdress"
            id="bitcoinAdress"
            onChange={handleChange}
            value={values.bitcoinAdress}
            type="text"
          ></InputField>
        </InputWrapper>
        {touched.bitcoinAdress && errors.bitcoinAdress && (
          <ErrorLineText>{errors.bitcoinAdress}</ErrorLineText>
        )}

        <WithdrawButton
          width="160px"
          padding="12px"
          type="submit"
          onClick={handlerClickSubmit}
        >
          <PrimaryTextSpan color="#1c2026" fontWeight="bold" fontSize="14px">
            Withdraw
          </PrimaryTextSpan>
        </WithdrawButton>
      </FlexContainer>
    </CustomForm>
  );
};

export default WithdrawFormBitcoin;

const CustomForm = styled.form`
  margin-bottom: 0;
`;

const WithdrawButton = styled(PrimaryButton)`
  margin-top: 16px;
`;

const InputField = styled.input`
  background-color: transparent;
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  font-weight: bold;
  font-size: 14px;
  line-height: 16px;
  color: #fffccc;
  padding: 8px 0 8px 8px;
  appearance: none;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  &:-webkit-input-placeholder {
    color: #fff;
    opacity: 0.3;
    font-weight: normal;
  }

  &:-ms-input-placeholder {
    color: #fff;
    opacity: 0.3;
    font-weight: normal;
  }

  &::placeholder {
    color: #fff;
    opacity: 0.3;
    font-weight: normal;
  }
`;

const InputWrapper = styled(FlexContainer)`
  border-radius: 4px;
  border: 1px solid
    ${props => (props.hasError ? '#ED145B' : 'rgba(255, 255, 255, 0.1)')};
  color: #fff;
  background-color: rgba(255, 255, 255, 0.06);
`;

const ErrorText = styled.span`
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  color: #ff557e;
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
`;

const ErrorLineText = styled.span`
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  color: #ff557e;
`;