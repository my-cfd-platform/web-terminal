import React, { FC } from 'react';
import { FlexContainer } from '../styles/FlexContainer';
import NavBar from '../components/NavBar/NavBar';
import { Observer } from 'mobx-react-lite';
import { useStores } from '../hooks/useStores';
import Loader from '../components/Loader';
import StepsContainter from '../components/KYC/StepsContainter';

const KYCcontainer: FC = props => {
  const { children } = props;
  const { mainAppStore } = useStores();

  return (
    <FlexContainer
      height="100vh"
      width="100vw"
      position="relative"
      flexDirection="column"
    >
      <Observer>
        {() => <Loader isLoading={mainAppStore.isLoading}></Loader>}
      </Observer>
      <NavBar></NavBar>
      <FlexContainer height="calc(100vh - 48px)" flexDirection="column">
        <StepsContainter></StepsContainter>
        {children}
      </FlexContainer>
    </FlexContainer>
  );
};
export default KYCcontainer;
