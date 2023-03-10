import React, { useEffect } from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import MarketsIcon from '../../assets/svg/icon-bottom-bar-markets.svg';
import PortfolioIcon from '../../assets/svg/icon-bottom-bar-portfolio.svg';
import IconHistory from '../../assets/svg/icon-sidebar-history.svg';
import IconEducation from '../../assets/svg/icon-education.svg';
import { LOCAL_STORAGE_SIDEBAR } from '../../constants/global';
import SideBarButton from './SideBarButton';
import styled from '@emotion/styled';
import { useStores } from '../../hooks/useStores';
import { SideBarTabType } from '../../enums/SideBarTabType';
import { observer, Observer } from 'mobx-react-lite';
import Badge from '../../styles/Badge';
import { useTranslation } from 'react-i18next';
import API from '../../helpers/API';
import EducationPopup from '../EducationPopup';
import { EducationResponseEnum } from '../../enums/EducationResponseEnum';
import LanguageButton from './LanguageButton';

const SideBar = observer(() => {
  const {
    tabsStore,
    dateRangeStore,
    quotesStore,
    mainAppStore,
    educationStore,
  } = useStores();
  const { t } = useTranslation();
  const setSideBarActive = (tabType: SideBarTabType) => () => {
    tabsStore.setTabExpanded(false);

    if (tabsStore.sideBarTabType === tabType) {
      tabsStore.setSideBarType(null);
      dateRangeStore.resetDatepicker();
    } else {
      tabsStore.setSideBarType(tabType);
      localStorage.setItem(LOCAL_STORAGE_SIDEBAR, `${tabType}`);
    }

    if (tabsStore.sideBarTabType !== SideBarTabType.History) {
      dateRangeStore.resetDatepicker();
    }
  };

  const pendingOrdersCount = quotesStore.pendingOrders.length;
  const activeOrdersCount = quotesStore.activePositions.length;

  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await API.getListOfCourses(mainAppStore.initModel.miscUrl);
        if (
          response.responseCode === EducationResponseEnum.Ok &&
          response.data.filter((item) => item.id && !!item.totalQuestions).length > 0
        ) {
          educationStore.setEducationIsLoaded(true);
          educationStore.setCoursesList(response.data);
        } else {
          if (tabsStore.sideBarTabType === SideBarTabType.Education) {
            tabsStore.setTabExpanded(false);
            tabsStore.setSideBarType(null);
          }
          educationStore.setEducationIsLoaded(false);
          educationStore.setCoursesList(null);
        }
      } catch {
        if (tabsStore.sideBarTabType === SideBarTabType.Education) {
          tabsStore.setTabExpanded(false);
          tabsStore.setSideBarType(null);
        }
        educationStore.setEducationIsLoaded(false);
        educationStore.setCoursesList(null);
      }
    }
    if (!mainAppStore.isPromoAccount && mainAppStore.canCheckEducation) {
      getCourses();
    }
  }, [
    mainAppStore.lang,
    mainAppStore.canCheckEducation,
  ]);

  return (
    <BottonNavBarWrapper
      flexDirection="column"
      height="100%"
      width="60px"
      zIndex="104"
      position="relative"
      backgroundColor="#1c2026"
      justifyContent="space-between"
      alignItems="center"
    >
      <FlexContainer flexDirection="column">
        <SideBarButton
          iconProps={MarketsIcon}
          title={t('Markets')}
          isActive={tabsStore.sideBarTabType === SideBarTabType.Markets}
          setSideBarActive={setSideBarActive(SideBarTabType.Markets)}
        />
        <SideBarButton
          iconProps={PortfolioIcon}
          title={t('Portfolio')}
          isActive={tabsStore.sideBarTabType === SideBarTabType.Portfolio}
          setSideBarActive={setSideBarActive(SideBarTabType.Portfolio)}
        >
          <Observer>
            {() => (
              <>
                {(activeOrdersCount > 0 || pendingOrdersCount > 0) && (
                  <CustomBadge>
                    {pendingOrdersCount > 0
                      ? `${activeOrdersCount}/${pendingOrdersCount}`
                      : activeOrdersCount}
                  </CustomBadge>
                )}
              </>
            )}
          </Observer>
        </SideBarButton>
        <SideBarButton
          iconProps={IconHistory}
          title={t('History')}
          isActive={tabsStore.sideBarTabType === SideBarTabType.History}
          setSideBarActive={setSideBarActive(SideBarTabType.History)}
        />
        {
          educationStore.educationIsLoaded &&
          educationStore.coursesList !== null &&
          educationStore.coursesList.filter((item) => item.id && item.totalQuestions > 0).length > 0 &&
          !mainAppStore.isPromoAccount &&
          <SideBarButton
            iconProps={IconEducation}
            title={t('Education')}
            isActive={tabsStore.sideBarTabType === SideBarTabType.Education}
            setSideBarActive={setSideBarActive(SideBarTabType.Education)}
          />
        }
      </FlexContainer>
      <NavBarButtonsWrapper margin="0 auto 24px">
        <LanguageButton></LanguageButton>
      </NavBarButtonsWrapper>
      <Observer>{() => <>{educationStore.showPopup && <EducationPopup> </EducationPopup>}</>}</Observer>
    </BottonNavBarWrapper>
  );
});

export default SideBar;

const BottonNavBarWrapper = styled(FlexContainer)`
  min-width: 60px;
`;

const CustomBadge = styled(Badge)`
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
`;

const NavBarButtonsWrapper = styled(FlexContainer)`
  padding: 0 8px;
  &:first-of-type {
    border-right: none;
  }
`;
