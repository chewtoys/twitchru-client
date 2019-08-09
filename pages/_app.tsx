import App, { Container } from 'next/app';
import Head from 'next/head';
import Router, { withRouter } from 'next/router';
import NProgress from 'nprogress';
import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import 'resize-observer-polyfill';
import { RouterContext } from '../hooks/useRouter';
import withApollo from '../lib/withApollo';
import { ThemeProvider } from 'styled-components';
import config from '../config';

const theme = {
  // primary: '#6441a4',
  // primaryLight: '#956dd6',
  // primaryDark: '#331774',
  // primaryText: '#fff',
  // secondary: '#1d1e31',
  // secondaryLight: '#45455a',
  // secondaryDark: '#000009',
  // secondaryText: '#fff',

  dark1Color: '#1D1E31',
  dark2Color: '#262841',
  accent2Color: '#968a9d',
  main1Color: '#6441A4',
  text1Color: '#eee'
};

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

interface IProps {
  isServer: boolean;
  apolloClient: any;
}

const InjectRouterContext = withRouter(({ router, children }) => {
  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
});

class MyApp extends App<IProps> {
  public render() {
    const { Component, pageProps, apolloClient } = this.props;

    return (
      <Container>
        <InjectRouterContext>
          <ApolloProvider client={apolloClient}>
            <ThemeProvider theme={theme}>
              <React.Fragment>
                <Head>
                  <link
                    rel="icon"
                    type="image/png"
                    href={`${config.cdnUrl}favicon.png`}
                  />
                  <title>PepegaCom</title>
                  <meta property="og:locale" content="ru_RU" />
                  <meta property="og:type" content="website" />
                  <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                    key="viewport"
                  />
                </Head>
                <Component {...pageProps} />
              </React.Fragment>
            </ThemeProvider>
          </ApolloProvider>
        </InjectRouterContext>
      </Container>
    );
  }
}

export default withApollo(MyApp);
