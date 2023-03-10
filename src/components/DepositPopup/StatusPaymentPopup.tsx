import React, { FC } from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import Modal from '../Modal';
import styled from '@emotion/styled';
import {
  PrimaryTextParagraph,
  PrimaryTextSpan,
} from '../../styles/TextsElements';
import paymentStatuses from '../../constants/paymentStatuses';
import { PrimaryButton } from '../../styles/Buttons';
import { useHistory } from 'react-router-dom';
import { useStores } from '../../hooks/useStores';
import Page from '../../constants/Pages';
import { ButtonWithoutStyles } from '../../styles/ButtonWithoutStyles';
import SvgIcon from '../SvgIcon';
import CloseIcon from '../../assets/svg/icon-close.svg';
import { useTranslation } from 'react-i18next';
import mixpanel from 'mixpanel-browser';
import mixpanelEvents from '../../constants/mixpanelEvents';
import { logger } from '../../helpers/ConsoleLoggerTool';
import * as failIcon from '../../assets/lotties/fail-icon.json';
import * as successIcon from '../../assets/lotties/success-icon.json';
import * as pendingIcon from '../../assets/lotties/pending-icon.json';
import * as confettie from '../../assets/lotties/confettie-animation.json';
import Lottie from 'react-lottie';
import Colors from '../../constants/Colors';

interface Props {
  status: string;
}

const StatusPaymentPopup: FC<Props> = ({ status }) => {
  const { push } = useHistory();
  const { depositFundsStore, bonusStore } = useStores();

  const getLottieOptions = (animationData: any, loop: boolean = false) => {
    return {
      loop: loop,
      autoplay: true,
      pause: false,
      animationData: animationData.default,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
        clearCanvas: false,
      },
    };
  };

  const backToDeposit = () => {
    if (bonusStore.showBonus() && bonusStore.bonusData !== null) {
      bonusStore.setShowBonusPopup(true);
    } else {
      push(Page.DEPOSIT_POPUP);
    }
  };

  const backToDashboard = () => {
    push(Page.DASHBOARD);
  };

  const { t } = useTranslation();

  const renderSuccessFail = () => {
    switch (status) {
      case paymentStatuses.SUCCESS:
        mixpanel.track(mixpanelEvents.DEPOSIT_PAGE_SUCCESS);

        return (
          <FlexContainer
            flexDirection="column"
            justifyContent="space-between"
            width="100%"
            height="100%"
          >
            <FlexContainer flexDirection="column" alignItems="center" position="relative">
              <FlexContainer
                left="49px"
                top="-49px"
                position="absolute"
                width="250px"
                height="250px"
              >
                <Lottie
                  options={getLottieOptions(confettie, true)}
                  height="250px"
                  width="250px"
                  isClickToPauseDisabled={true}
                />
              </FlexContainer>
              <FlexContainer
                width="138px"
                height="138px"
                marginBottom="40px"
                alignItems="center"
                justifyContent="center"
              >
                <Lottie
                  options={getLottieOptions(successIcon)}
                  height="138px"
                  width="138px"
                  isClickToPauseDisabled={true}
                />
              </FlexContainer>
              <PrimaryTextParagraph
                fontSize="20px"
                color={Colors.WHITE}
                marginBottom="8px"
              >
                {t('Success')}
              </PrimaryTextParagraph>
              <PrimaryTextSpan fontSize="13px" color={Colors.WHITE_LIGHT}>
                {t('The operation was succesful.')}
              </PrimaryTextSpan>
            </FlexContainer>
            <PrimaryButton
              onClick={backToDashboard}
              width="100%"
              padding="20px"
            >
              <PrimaryTextSpan
                fontWeight="bold"
                fontSize="16px"
                color={Colors.DARK_BLACK}
              >
                {t('Back to Trading')}
              </PrimaryTextSpan>
            </PrimaryButton>
          </FlexContainer>
        );

      case paymentStatuses.FAILED:
        mixpanel.track(mixpanelEvents.DEPOSIT_PAGE_FAILED);
        return (
          <FlexContainer
            flexDirection="column"
            justifyContent="space-between"
            height="100%"
            width="100%"
          >
            <FlexContainer flexDirection="column" alignItems="center">
              <FlexContainer
                width="138px"
                height="138px"
                marginBottom="40px"
                alignItems="center"
                justifyContent="center"
              >
                <Lottie
                  options={getLottieOptions(failIcon)}
                  height="138px"
                  width="138px"
                  isClickToPauseDisabled={true}
                />
              </FlexContainer>
              <PrimaryTextParagraph
                fontSize="20px"
                color={Colors.WHITE}
                marginBottom="8px"
              >
                {t('Failed')}
              </PrimaryTextParagraph>
              <PrimaryTextSpan
                fontSize="13px"
                color={Colors.WHITE_LIGHT}
                textAlign="center"
              >
                {t('Something went wrong.')}
                <br />
                {t('Try again or use another payment method.')}
              </PrimaryTextSpan>
            </FlexContainer>
            <PrimaryButton onClick={backToDeposit} width="100%" padding="20px">
              <PrimaryTextSpan
                fontWeight="bold"
                fontSize="16px"
                color={Colors.DARK_BLACK}
              >
                {t('Back to Deposit')}
              </PrimaryTextSpan>
            </PrimaryButton>
          </FlexContainer>
        );

      case paymentStatuses.PENDING:
        mixpanel.track(mixpanelEvents.DEPOSIT_PAGE_PENDING);
        return (
          <FlexContainer
            flexDirection="column"
            justifyContent="space-between"
            height="100%"
            width="100%"
          >
            <FlexContainer flexDirection="column" alignItems="center">
              <FlexContainer
                width="138px"
                marginBottom="40px"
                alignItems="center"
                justifyContent="center"
                height="138px"
              >
                <Lottie
                  options={getLottieOptions(pendingIcon)}
                  height="138px"
                  width="138px"
                  isClickToPauseDisabled={true}
                />
              </FlexContainer>
              <PrimaryTextParagraph
                fontSize="20px"
                color={Colors.WHITE}
                marginBottom="8px"
              >
                {t('Pending')}
              </PrimaryTextParagraph>
              <FlexContainer flexDirection="column" padding="8px">
                <PrimaryTextSpan
                  fontSize="13px"
                  color={Colors.WHITE_LIGHT}
                  textAlign="center"
                  marginBottom="12px"
                >
                  {t('Thank you for your transaction')}
                </PrimaryTextSpan>
                <PrimaryTextSpan
                  fontSize="13px"
                  color={Colors.WHITE_LIGHT}
                  textAlign="center"
                  marginBottom="12px"
                >
                  {t(
                    'Please note, that it is now being processed and it might take up to 2 business days'
                  )}
                </PrimaryTextSpan>
                <PrimaryTextSpan
                  fontSize="13px"
                  color={Colors.WHITE_LIGHT}
                  textAlign="center"
                >
                  {t('You will receive an update to your e-mail')}
                </PrimaryTextSpan>
              </FlexContainer>
            </FlexContainer>
            <PrimaryButton onClick={backToDashboard} width="100%" padding="20px">
              <PrimaryTextSpan
                fontWeight="bold"
                fontSize="16px"
                color={Colors.DARK_BLACK}
              >
                {t('Back to Trading')}
              </PrimaryTextSpan>
            </PrimaryButton>
          </FlexContainer>
        );

      default:
        return null;
    }
  };
  return (
    <>
      <Modal>
        <BackgroundWrapperLayout
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          justifyContent="center"
          alignItems="center"
          zIndex="1000"
        >
          <FlexContainer
            boxShadow="0px 12px 24px rgba(0, 0, 0, 0.25), 0px 6px 12px rgba(0, 0, 0, 0.25)"
            borderRadius="4px"
            backgroundColor="rgba(0,0,0,0.4)"
            position="relative"
            width="408px"
            height="538px"
            flexDirection="column"
            padding="70px 30px 44px"
            alignItems="center"
          >
            <FlexContainer position="absolute" top="18px" right="18px">
              <ButtonWithoutStyles onClick={backToDashboard}>
                <SvgIcon
                  {...CloseIcon}
                  fillColor={Colors.WHITE_LIGHT}
                  hoverFillColor={Colors.PRIMARY}
                />
              </ButtonWithoutStyles>
            </FlexContainer>
            {renderSuccessFail()}
          </FlexContainer>
        </BackgroundWrapperLayout>
      </Modal>
    </>
  );
};

export default StatusPaymentPopup;

const BackgroundWrapperLayout = styled(FlexContainer)`
  background-color: rgba(0, 0, 0, 0.7);
  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    background-color: rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(12px);
  }
`;
