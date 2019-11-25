import React, { useContext, useEffect, useState } from 'react';
import { Switch, Router } from 'react-router';
import routesList from '../constants/routesList';
import { MainAppContext } from '../store/MainAppProvider';
import RouteWrapper from '../components/RouteWrapper';
import { appHistory } from './history';

interface Props {}

function RoutingLayout(props: Props) {
  const {} = props;

  return (
    <Router history={appHistory}>
      <Switch>
        {routesList.map(route => (
          <RouteWrapper key={route.path} {...route} />
        ))}
      </Switch>
    </Router>
  );
}

export default RoutingLayout;
