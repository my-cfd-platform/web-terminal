import React from 'react';
import { FlexContainer } from '../styles/FlexContainer';
import RealDemoImage from '../assets/images/demo-real.png';
import { PrimaryTextParagraph, PrimaryTextSpan } from '../styles/TextsElements';
import styled from '@emotion/styled';
import { ButtonWithoutStyles } from '../styles/ButtonWithoutStyles';
import Modal from './Modal';
import { useStores } from '../hooks/useStores';
import API from '../helpers/API';
import KeysInApi from '../constants/keysInApi';
import Topics from '../constants/websocketTopics';
import Fields from '../constants/fields';
import { Observer } from 'mobx-react-lite';
import BadRequestPopup from './BadRequestPopup';
import HashLocation from '../constants/hashLocation';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mixpanel from 'mixpanel-browser';
import mixpanelEvents from '../constants/mixpanelEvents';
import mixapanelProps from '../constants/mixpanelProps';
import Page from '../constants/Pages';
import { HintEnum } from '../enums/HintsEnum';
import Colors from '../constants/Colors';

function DemoRealPopup() {
  const { push } = useHistory();
  const {
    mainAppStore,
    badRequestPopupStore,
    bonusStore,
    educationStore
  } = useStores();
  const { t } = useTranslation();

  const sendMixpanelEvents = (demoRealFunds: 'real' | 'demo') => {
    mixpanel.track(mixpanelEvents.DEMO_REAL_WELCOME, {
      [mixapanelProps.DEMO_REAL_FUNDS]: demoRealFunds,
    });
  };

  const selectDemoAccount = async () => {
    const acc = mainAppStore.accounts.find((item) => !item.isLive);
    if (acc) {
      mainAppStore.setActiveAccount(acc);
      mainAppStore.activeSession?.send(Topics.SET_ACTIVE_ACCOUNT, {
        [Fields.ACCOUNT_ID]: acc.id,
      });
      mainAppStore.addTriggerDissableOnboarding();
      mainAppStore.setIsDemoReal(false);
      sendMixpanelEvents('demo');
      educationStore.setFTopenHint(HintEnum.DemoACC);
    }
  };

  const selectRealAccount = async () => {
    const acc = mainAppStore.accounts.find((item) => item.isLive);
    if (acc) {
      mainAppStore.setActiveAccount(acc);
      mainAppStore.activeSession?.send(Topics.SET_ACTIVE_ACCOUNT, {
        [Fields.ACCOUNT_ID]: acc.id,
      });
      mainAppStore.addTriggerDissableOnboarding();
      try {
        await bonusStore.getUserBonus();
        if (bonusStore.showBonus() && bonusStore.bonusData !== null) {
          bonusStore.setShowBonusPopup(true);
        } else {
          push(Page.DEPOSIT_POPUP);
        }
      } catch (error) {
        push(Page.DEPOSIT_POPUP);
      }
      sendMixpanelEvents('real');
      educationStore.setFTopenHint(HintEnum.Deposit);
      setTimeout(() => {
        mainAppStore.setIsDemoReal(false);
      }, 500);
    }
  };

  const handleInvestReal = () => {
    selectRealAccount();
  };

  return (
    <>
      <Observer>
        {() => <>{badRequestPopupStore.isActive && <BadRequestPopup />}</>}
      </Observer>

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
            width="534px"
            flexDirection="column"
            padding="65px 52px 40px"
            alignItems="center"
          >
            <FlexContainer margin="0 0 42px 0" flexDirection="column">
              <img width={174} src={RealDemoImage}></img>
            </FlexContainer>
            <PrimaryTextParagraph
              fontSize="20px"
              fontWeight="bold"
              marginBottom="10px"
              color={Colors.ACCENT}
            >
              {t('Congratulations!')}
            </PrimaryTextParagraph>
            <PrimaryTextParagraph
              fontSize="11px"
              color={Colors.ACCENT}
              marginBottom="42px"
            >
              {t('You Have Been Successfully Registered')}
            </PrimaryTextParagraph>
            <FlexContainer justifyContent="space-between">
              <DemoButton onClick={selectDemoAccount} isSingle={mainAppStore.isPromoAccount}>
                <PrimaryTextSpan fontSize="14px" fontWeight="bold" color={Colors.WHITE}>
                  {t('Practice on Demo')}
                </PrimaryTextSpan>
              </DemoButton>
              {!mainAppStore.isPromoAccount && (
                <RealButton onClick={handleInvestReal}>
                  <PrimaryTextSpan
                    fontSize="14px"
                    fontWeight="bold"
                    color={Colors.DARK_BLACK}
                  >
                    {t('Invest Real funds')}
                  </PrimaryTextSpan>
                </RealButton>
              )}
            </FlexContainer>
          </FlexContainer>
        </BackgroundWrapperLayout>
      </Modal>
    </>
  );
}

export default DemoRealPopup;

const DemoButton = styled(ButtonWithoutStyles)<{isSingle: boolean;}>`
  border-radius: 4px;
  background-color: ${Colors.DANGER};
  width: 200px;
  height: 40px;
  transition: all 0.2s ease;
  will-change: background-color;
  margin-right: ${props => props.isSingle ? '' : '30px'};
  &:hover {
    background-color: ${Colors.DANGER_LIGHT};
  }
`;

const RealButton = styled(ButtonWithoutStyles)`
  border-radius: 4px;
  background-color: ${Colors.PRIMARY};
  width: 200px;
  height: 40px;
  transition: all 0.2s ease;
  will-change: background-color;

  &:hover {
    background-color: ${Colors.PRIMARY_LIGHT};
  }
`;

const BackgroundWrapperLayout = styled(FlexContainer)`
  background-color: rgba(0, 0, 0, 0.7);
  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    background-color: rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(12px);
  }
`;
