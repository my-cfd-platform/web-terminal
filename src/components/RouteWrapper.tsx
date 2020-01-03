import React, { FunctionComponent, FC } from 'react';
import { Route, Redirect } from 'react-router';
import Page from '../constants/Pages';
import { RouteLayoutType } from '../constants/routesList';
import { observer } from 'mobx-react-lite';
import { useStores } from '../hooks/useStores';

interface IProps {
  component: FunctionComponent<any>;
  layoutType: RouteLayoutType;
}

type Props = IProps;

const RouteWrapper: FC<Props> = observer(props => {
  const { component: Component, layoutType, ...otherProps } = props;
  const { mainAppStore } = useStores();

  if (mainAppStore.isAuthorized && layoutType === RouteLayoutType.SignUp) {
    return <Redirect to={Page.DASHBOARD} />;
  } else if (
    !mainAppStore.isAuthorized &&
    layoutType === RouteLayoutType.Authorized
  ) {
    return <Redirect to={Page.SIGN_IN} />;
  }

  return (
    <Route
      {...otherProps}
      render={routeProps => <Component {...routeProps} />}
    />
  );
});

export default RouteWrapper;