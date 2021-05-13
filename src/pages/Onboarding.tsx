import React, { useEffect, useRef, useState } from 'react';
import { FlexContainer } from '../styles/FlexContainer';
import { PrimaryTextSpan } from '../styles/TextsElements';
import { PrimaryButton } from '../styles/Buttons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Lottie from 'react-lottie';
import API from '../helpers/API';
import { useStores } from '../hooks/useStores';
import { OnBoardingInfo } from '../types/OnBoardingTypes';
import LoaderForComponents from '../components/LoaderForComponents';
import { ButtonActionType } from '../enums/ButtonActionType';
import Page from '../constants/Pages';
import mixpanel from 'mixpanel-browser';
import mixpanelEvents from '../constants/mixpanelEvents';
import mixapanelProps from '../constants/mixpanelProps';
import KeysInApi from '../constants/keysInApi';
import Topics from '../constants/websocketTopics';
import Fields from '../constants/fields';
import styled from '@emotion/styled';
import { ButtonWithoutStyles } from '../styles/ButtonWithoutStyles';
import SvgIcon from '../components/SvgIcon';
import IconClose from '../assets/svg/icon-close.svg';
import { keyframes } from '@emotion/core';

const Onboarding = () => {
  const { t } = useTranslation();
  const { push } = useHistory();
  const {
    badRequestPopupStore,
    mainAppStore
  } = useStores();

  const [actualStep, setActualStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [actualStepInfo, setActualStepInfo] = useState<OnBoardingInfo | null>(null);

  const getLottieOptions = (step: any) => {
    return {
      loop: false,
      autoplay: true,
      pause: false,
      animationData: JSON.parse(step),
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };
  };

  const getInfoByStep = async (step: number) => {
    try {
      const response = await API.getOnBoardingInfoByStep(step, 1, mainAppStore.initModel.miscUrl);
      if (response.responseCode === 0) {
        setActualStepInfo(response);
        setActualStep(step);
        setLoading(false);
      } else {
       push(Page.DASHBOARD);
      }
    } catch (error) {
      push(Page.DASHBOARD);
    }
  };

  const handleClickLottie = (e: any) => {
    e.preventDefault();
  };

  const handleChangeStep = (nextStep: number) => () => {
    getInfoByStep(nextStep);
  };

  const closeOnBoarding = () => {
    if (actualStepInfo?.data.totalSteps) {
      mixpanel.track(mixpanelEvents.ONBOARDING, {
        [mixapanelProps.ONBOARDING_VALUE]: `close${actualStep}`,
      });
      setActualStep(actualStepInfo?.data.totalSteps);
      getInfoByStep(actualStepInfo?.data.totalSteps);
    }
  };

  const selectDemoAccount = async () => {
    const acc = mainAppStore.accounts.find((item) => !item.isLive);
    if (acc) {
      try {
        await API.setKeyValue(
          {
            key: KeysInApi.ACTIVE_ACCOUNT_ID,
            value: acc.id,
          }
        );
        mainAppStore.activeSession?.send(Topics.SET_ACTIVE_ACCOUNT, {
          [Fields.ACCOUNT_ID]: acc.id,
        });
        mainAppStore.setActiveAccount(acc);
        mixpanel.track(mixpanelEvents.ONBOARDING, {
          [mixapanelProps.ONBOARDING_VALUE]: `demo${actualStep}`,
        });
        push(Page.DASHBOARD);
        mainAppStore.isDemoRealPopup = false;
      } catch (error) {
        badRequestPopupStore.openModal();
        badRequestPopupStore.setMessage(error);
      }
    }
  };

  const selectRealAccount = async () => {
    const acc = mainAppStore.accounts.find((item) => item.isLive);
    if (acc) {
      try {
        await API.setKeyValue(
          {
            key: KeysInApi.ACTIVE_ACCOUNT_ID,
            value: acc.id,
          }
        );
        mainAppStore.activeSession?.send(Topics.SET_ACTIVE_ACCOUNT, {
          [Fields.ACCOUNT_ID]: acc.id,
        });
        mainAppStore.setActiveAccount(acc);
        mainAppStore.isLoading = true;
        mixpanel.track(mixpanelEvents.ONBOARDING, {
          [mixapanelProps.ONBOARDING_VALUE]: `real${actualStep}`,
        });
        push(Page.DEPOSIT_POPUP);
        mainAppStore.isDemoRealPopup = false;
      } catch (error) {
        badRequestPopupStore.openModal();
        badRequestPopupStore.setMessage(error);
      }
    }
  }

  const actionByType = (type: ButtonActionType) => {
    switch (type) {
      case ButtonActionType.NextStep:
        return handleChangeStep(actualStep + 1);
      case ButtonActionType.Demo:
        return selectDemoAccount;
      case ButtonActionType.Deposit:
        return selectRealAccount;
      default:
        return handleChangeStep(actualStep + 1);
    }
  };

  useEffect(() => {
    getInfoByStep(1);
    mixpanel.track(mixpanelEvents.ONBOARDING, {
      [mixapanelProps.ONBOARDING_VALUE]: 'start1',
    });
  }, []);

  if (loading || actualStepInfo === null ) {
    return <LoaderForComponents isLoading={loading} />;
  }

  return (
    <FlexContainer
      flexDirection="column"
      justifyContent="space-between"
      width="100%"
      height="100%"
    >
      <PageHeaderWrap>
        <BackButton onClick={closeOnBoarding}>
          <SvgIcon
            {...IconClose}
            fillColor="rgba(255, 255, 255, 0.6)"
            hoverFillColor="#ffffff"
            width="40px"
            height="40px"
          />
        </BackButton>
        <PageTitle
          fontSize="16px"
          color="#ffffff"
          textTransform="capitalize"
          className={'onboarding_title'}
        >
          {actualStep} / {actualStepInfo?.data.totalSteps} {t('steps')}
        </PageTitle>
      </PageHeaderWrap>
      <FlexContainer
        flexDirection="column"
        width="100%"
        onClick={
          actualStepInfo?.data.fullScreen ?
            handleChangeStep(actualStep + 1) :
            handleClickLottie
        }
      >
        <Lottie options={getLottieOptions(actualStepInfo?.data.lottieJson)}
          isStopped={false}
          height="600px"
          width="650px"
        />
      </FlexContainer>
      {!actualStepInfo?.data.fullScreen &&
        <>
          <FlexContainer
            width="100%"
            alignItems="center"
            justifyContent="center"
            padding="0 16px 40px"
            flexDirection="column"
            position="relative"
            margin="-100px 0 0 0"
          >
            {actualStepInfo?.data.title && <PrimaryTextSpan
              fontSize="24px"
              color="#ffffff"
              marginBottom="16px"
              textAlign="center"
            >
              {actualStepInfo?.data.title}
            </PrimaryTextSpan>}
            {actualStepInfo?.data.description && <PrimaryTextSpan
              fontSize="16px"
              color="rgba(235, 235, 245, 0.6)"
              textAlign="center"
            >
              {actualStepInfo?.data.description}
            </PrimaryTextSpan>}
          </FlexContainer>
          <FlexContainer
              width="100%"
              alignItems="center"
              justifyContent="center"
              padding="0 16px 40px"
              flexDirection="column"
          >
            {actualStepInfo?.data.buttons.map((button) => <OnboardingButton
              padding="12px"
              type="button"
              width="320px"
              onClick={actionByType(button.action)}
              isDemo={button.action === ButtonActionType.Demo}
              key={`${button.action}_${actualStep}`}
            >
              <PrimaryTextSpan
                color={
                  button.action === ButtonActionType.Demo ?
                    '#ffffff' :
                    '#252636'
                }
                fontWeight="bold"
                fontSize="16px"
              >
                {button.text}
              </PrimaryTextSpan>
            </OnboardingButton>)}
          </FlexContainer>
        </>
      }
    </FlexContainer>
  );
};

export default Onboarding;

const BackButton = styled(ButtonWithoutStyles)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 30px;
  z-index: 1;
  position: absolute;
  top: 12px;
  left: 16px;
`;

const PageHeaderWrap = styled(FlexContainer)`
  height: 72px;
  justify-content: center;
  padding-top: 18px;
  width: 100vw;
`;

const PageTitle = styled(PrimaryTextSpan)`
  &.onboarding_title {
    text-transform: lowercase;
    &::first-letter {
      color: #00ffdd;
    }
  }
`;

const translateAnimationIn = keyframes`
    from {
      transform: translateY(150px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
`;

const buttonAnimation = keyframes`
    from {
      background-color: rgba(196, 196, 196, 0.5);
    }
    to {
      background-color: #00FFDD;
    }
`;

const BottomWrapper = styled(FlexContainer)`
  opacity: 1;
  transform: translateY(0);
  animation: ${translateAnimationIn} 0.5s ease;
`;

const OnboardingButton = styled(PrimaryButton)<{ isDemo: boolean }>`
  animation: ${(props) => !props.isDemo && buttonAnimation} 2s ease;
  background-color: ${(props) => props.isDemo && 'transparent'}
`;