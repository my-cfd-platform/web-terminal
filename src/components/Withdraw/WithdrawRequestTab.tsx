import React, { useState, useCallback } from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { FlexContainer } from '../../styles/FlexContainer';
import { PrimaryTextSpan } from '../../styles/TextsElements';
import styled from '@emotion/styled';
import { ButtonWithoutStyles } from '../../styles/ButtonWithoutStyles';
import { SecondaryButton, PrimaryButton } from '../../styles/Buttons';

import CardIcon from '../../assets/images/master-card.png';
import BankTransferIcon from '../../assets/svg/icon-bank-transfer.svg';
import BitcoinIcon from '../../assets/svg/icon-bitcoin.svg';

import IconFast from '../../assets/svg/icon-fast.svg';
import IconNoCommission from '../../assets/images/icon-no-commission.png';
import IconNoLimits from '../../assets/images/icon-no-limit.png';
import IconFaq from '../../assets/images/icon-faq.png';

import WithdrawPagePopup from '../../components/Withdraw/WithdrawPagePopup';
import SvgIcon from '../SvgIcon';
import { useStores } from '../../hooks/useStores';
import { WithdrawalTypesEnum } from '../../enums/WithdrawalTypesEnum';
import API from '../../helpers/API';
import { CreateWithdrawalParams } from '../../types/WithdrawalTypes';
import WithdrawEmptyBalance from './WithdrawEmptyBalance';
import { PersonalDataKYCEnum } from '../../enums/PersonalDataKYCEnum';
import WithdrawFormBankTransfer from './WithdrawPaymentForm/WithdrawFormBankTransfer';
import WithdrawFormBitcoin from './WithdrawPaymentForm/WithdrawFormBitcoin';
import { Observer } from 'mobx-react-lite';
import WithdrawPendingPopup from './WithdrawPendingPopup';


const PRECISION_USD = 2;

const WithdrawRequestTab = () => {
  const { mainAppStore, withdrawalStore } = useStores();
  const [paymentMeyhod, setPaymentMethod] = useState(
    WithdrawalTypesEnum.BankTransfer
  );

    
  return (
    <FlexContainer
      flexDirection="column"
      minHeight="calc(100vh - 234px)"
      justifyContent="space-between"
      position="relative"
    >
      <Observer>
        {() => (
          <>
            {withdrawalStore.pendingPopup && <WithdrawPendingPopup />}
          </>
        )}
      </Observer>
      <FlexContainer flexDirection="column">
        <FlexContainer marginBottom="48px">
          <FlexContainer flexDirection="column" width="180px">
            <PrimaryTextSpan
              textTransform="uppercase"
              fontSize="12px"
              color="rgba(255,255,255,0.4)"
              marginBottom="8px"
            >
              Total
            </PrimaryTextSpan>
            <PrimaryTextSpan
              textTransform="uppercase"
              fontSize="24px"
              fontWeight="bold"
              color="#FFFCCC"
            >
              {mainAppStore.accounts.find(item => item.isLive)?.symbol}
              {mainAppStore.accounts
                .find(item => item.isLive === true)
                ?.balance.toFixed(2)}
            </PrimaryTextSpan>
          </FlexContainer>

          <FlexContainer flexDirection="column" width="180px">
            <PrimaryTextSpan
              textTransform="uppercase"
              fontSize="12px"
              color="rgba(255,255,255,0.4)"
              marginBottom="12px"
            >
              Available
            </PrimaryTextSpan>
            <PrimaryTextSpan
              textTransform="uppercase"
              fontSize="14px"
              fontWeight="bold"
              color="#FFFCCC"
            >
              {mainAppStore.accounts.find(item => item.isLive)?.symbol}
              {mainAppStore.accounts
                .find(item => item.isLive)
                ?.balance.toFixed(2)}
            </PrimaryTextSpan>
          </FlexContainer>
        </FlexContainer>

        <FlexContainer flexDirection="column">
          {Number(
            mainAppStore.accounts.find(item => item.isLive)?.balance
          ) > 0 && (
            <FlexContainer flexDirection="column">
              {mainAppStore.profileStatus ===
                PersonalDataKYCEnum.NotVerified && <WithdrawPagePopup />}
              <PrimaryTextSpan
                textTransform="uppercase"
                fontSize="12px"
                color="rgba(255,255,255,0.4)"
                marginBottom="12px"
              >
                Payment methods
              </PrimaryTextSpan>
              <FlexContainer width="100%" marginBottom="16px">
                <WithdrawPaymenMethodtItem
                  active={paymentMeyhod === WithdrawalTypesEnum.BankTransfer}
                  // TODO: reafactor
                  onClick={() => {
                    setPaymentMethod(WithdrawalTypesEnum.BankTransfer);
                  }}
                >
                  <FlexContainer>
                    <SvgIcon {...BankTransferIcon} fillColor="#FFFCCC" />
                  </FlexContainer>
                  <FlexContainer flexDirection="column">
                    <PrimaryTextSpan
                      fontWeight="bold"
                      fontSize="12px"
                      color="#FFFCCC"
                      textAlign="left"
                    >
                      Bank transfer
                    </PrimaryTextSpan>
                    <PrimaryTextSpan
                      fontSize="12px"
                      color="rgba(255,255,255,0.4)"
                      textAlign="left"
                    >
                      Other methods will be available
                    </PrimaryTextSpan>
                  </FlexContainer>
                </WithdrawPaymenMethodtItem>

                <WithdrawPaymenMethodtItem
                  active={paymentMeyhod === WithdrawalTypesEnum.Bitcoin}
                  onClick={() => {
                    setPaymentMethod(WithdrawalTypesEnum.Bitcoin);
                  }}
                >
                  <FlexContainer>
                    <SvgIcon {...BitcoinIcon} fillColor="#FFFCCC" />
                  </FlexContainer>
                  <FlexContainer flexDirection="column">
                    <PrimaryTextSpan
                      fontWeight="bold"
                      fontSize="12px"
                      color="#FFFCCC"
                      textAlign="left"
                    >
                      Bitcoin
                    </PrimaryTextSpan>
                    <PrimaryTextSpan
                      fontSize="12px"
                      color="rgba(255,255,255,0.4)"
                      textAlign="left"
                    >
                      Other methods will be available
                    </PrimaryTextSpan>
                  </FlexContainer>
                </WithdrawPaymenMethodtItem>
              </FlexContainer>


              <FlexContainer>
                
                {paymentMeyhod === WithdrawalTypesEnum.BankTransfer && <WithdrawFormBankTransfer />}
                {paymentMeyhod === WithdrawalTypesEnum.Bitcoin && <WithdrawFormBitcoin />}
              </FlexContainer>
            </FlexContainer>
          )}
          {Number(
            mainAppStore.accounts.find(item => item.isLive === true)?.balance
          ) === 0 && <WithdrawEmptyBalance />}
        </FlexContainer>
      </FlexContainer>

      <FlexContainer flexDirection="column">
        <FlexContainer justifyContent="space-between">
          <WithdrawCardItem>
            <FlexContainer>
              <SvgIcon {...IconFast} fillColor="#FFFCCC" />
            </FlexContainer>
            <FlexContainer flexDirection="column">
              <PrimaryTextSpan
                fontWeight="bold"
                fontSize="12px"
                color="#FFFCCC"
              >
                Fast
              </PrimaryTextSpan>
              <PrimaryTextSpan fontSize="12px" color="rgba(255,255,255,0.4)">
                A request is processed
                <br /> within 24 hours
              </PrimaryTextSpan>
            </FlexContainer>
          </WithdrawCardItem>

          <WithdrawCardItem>
            <FlexContainer>
              <img src={IconNoCommission} height="16px" />
            </FlexContainer>
            <FlexContainer flexDirection="column">
              <PrimaryTextSpan
                fontWeight="bold"
                fontSize="12px"
                color="#FFFCCC"
              >
                No commission
              </PrimaryTextSpan>
              <PrimaryTextSpan fontSize="12px" color="rgba(255,255,255,0.4)">
                The commission for
                <br /> withdrawing is 0%
              </PrimaryTextSpan>
            </FlexContainer>
          </WithdrawCardItem>

          <WithdrawCardItem>
            <FlexContainer>
              <img src={IconNoLimits} height="11px" />
            </FlexContainer>
            <FlexContainer flexDirection="column">
              <PrimaryTextSpan
                fontWeight="bold"
                fontSize="12px"
                color="#FFFCCC"
              >
                No limits
              </PrimaryTextSpan>
              <PrimaryTextSpan fontSize="12px" color="rgba(255,255,255,0.4)">
                Unlimited maximum
                <br /> withdrawal amount
              </PrimaryTextSpan>
            </FlexContainer>
          </WithdrawCardItem>
        </FlexContainer>

        <FaqOpenBlock>
          <FlexContainer>
            <img src={IconFaq} width="40px" height="40px" />

            <FlexContainer flexDirection="column" padding="0 16px">
              <PrimaryTextSpan
                textTransform="uppercase"
                color="#FFFCCC"
                fontSize="14px"
                lineHeight="16px"
              >
                Faq
              </PrimaryTextSpan>
              <PrimaryTextSpan
                color="#FFFFFF"
                fontSize="14px"
                lineHeight="16px"
              >
                Frequently Asked Questions
              </PrimaryTextSpan>
            </FlexContainer>
          </FlexContainer>
          <FlexContainer>
            <ButtonOpenFaq>
              <PrimaryTextSpan
                color="#fffccc"
                fontSize="14px"
                fontWeight="normal"
              >
                Open
              </PrimaryTextSpan>
            </ButtonOpenFaq>
          </FlexContainer>
        </FaqOpenBlock>
      </FlexContainer>
    </FlexContainer>
  );
};

export default WithdrawRequestTab;


const WithdrawCardItem = styled(FlexContainer)`
  border-radius: 4px;
  padding: 16px 12px;
  height: 120px;
  width: 228px;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.4s ease;
  background: rgba(255, 255, 255, 0.06);
`;

const WithdrawPaymenMethodtItem = styled(ButtonWithoutStyles)<{
  active: boolean;
}>`
  display: flex;
  border: 2px solid ${props => (props.active ? '#FFFCCC' : 'transparent')};
  background: ${props =>
    props.active ? '#373737' : 'rgba(255, 255, 255, 0.06)'};
  border-radius: 4px;
  padding: 16px 12px;
  height: 120px;
  width: 228px;
  margin-right: 16px;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.4s ease;
`;

const FaqOpenBlock = styled(FlexContainer)`
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  background: rgba(41, 44, 51, 0.5);
  border: 1px solid rgba(112, 113, 117, 0.5);
  border-radius: 5px;
  padding: 16px;
`;

const ButtonOpenFaq = styled(SecondaryButton)`
  width: 132px;
  height: 40px;
`;


