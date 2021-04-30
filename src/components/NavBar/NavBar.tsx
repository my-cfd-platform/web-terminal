import React from 'react';
import { FlexContainer } from '../../styles/FlexContainer';
import styled from '@emotion/styled';
import LanguageButton from './LanguageButton';
import UserProfileButton from './UserProfileButton';
import DepositButton from './DepositButton';
import { observer } from 'mobx-react-lite';
import AccountSwitcherDropdown from './AccountSwitcherDropdown';
import { Link } from 'react-router-dom';
import Page from '../../constants/Pages';
import Logo from '../Logo';
import { useStores } from '../../hooks/useStores';

const NavBar = observer(() => {
  const { mainAppStore } = useStores();
  return (
    <FlexContainer
      padding="8px 0 8px 20px"
      alignItems="center"
      width="100%"
      height="48px"
      justifyContent="space-between"
      zIndex="105"
    >
      <FlexContainer alignItems="center">
        <Link to={Page.DASHBOARD}>
          <FlexContainer alignItems="center">
            <FlexContainer margin="0 6px 0 0" width="102px">
              <Logo src={mainAppStore.initModel.logo} />
            </FlexContainer>
          </FlexContainer>
        </Link>
      </FlexContainer>
      <FlexContainer alignItems="center">
        <FlexContainer alignItems="center" margin="0 20px 0 0">
          <AccountSwitcherDropdown></AccountSwitcherDropdown>
        </FlexContainer>

        {!mainAppStore.isPromoAccount && (
          <FlexContainer margin="0 20px 0 0">
            <DepositButton />
          </FlexContainer>
        )}

        <UserProfileButton></UserProfileButton>
        <NavBarButtonsWrapper>
          <LanguageButton></LanguageButton>
        </NavBarButtonsWrapper>
      </FlexContainer>
    </FlexContainer>
  );
});
export default NavBar;

const NavBarButtonsWrapper = styled(FlexContainer)`
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 8px;
  &:first-of-type {
    border-right: none;
  }
`;
