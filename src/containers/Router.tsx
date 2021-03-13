import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Route as RouteType } from '../types';
import { GameContext, PlayersContext } from './App';

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    '&:last-child': {
      marginBottom: 0,
    },
  },
}));

export default function Router({ routes }: { routes: RouteType[] }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Switch>
      {routes.map(route => (
        <RouteWithSubRoutes {...route} key={route.id} />
      ))}
      <Route
        component={() => (
          <Typography variant="h1" className={classes.title}>
            {t('pageNotFound')}
          </Typography>
        )}
      />
    </Switch>
  );
}

function RouteWithSubRoutes(route: RouteType) {
  const classes = useStyles();
  const gameContext = useContext(GameContext);
  const playersContext = useContext(PlayersContext);
  const { t } = useTranslation();

  const error =
    route.error && route.error({ game: gameContext.state, players: playersContext.state });

  return (
    <div>
      {route.exact && (
        <Typography variant="h1" className={classes.title}>
          {t(route.id)}
        </Typography>
      )}
      {error ? (
        <Typography variant="subtitle1">{t(error)}</Typography>
      ) : (
        <Route
          path={route.path}
          exact={route.exact}
          render={props => <route.component {...props} routes={route.routes} />}
        />
      )}
    </div>
  );
}
