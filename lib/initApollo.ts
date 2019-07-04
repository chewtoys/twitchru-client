import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { setContext } from 'apollo-link-context';
import { WebSocketLink } from 'apollo-link-ws';
import { RestLink } from 'apollo-link-rest';
import { getMainDefinition } from 'apollo-utilities';
import fetch from 'isomorphic-unfetch';
import fetchHeaders from 'fetch-headers';
import config from '../config';
import { getAccessTokenAsync } from './auth';

let apolloClient = null;

interface IProcess {
  browser: boolean;
}

declare var process: IProcess;

interface IGlobal {
  fetch: any;
  Headers: any;
}
declare var global: IGlobal;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

if (global.Headers == null) {
  global.Headers = fetchHeaders;
}

function create(initialState) {
  const httpLink = new BatchHttpLink({
    uri: config.gqlUrl,
    credentials: 'same-origin'
  });

  const authLink = setContext(async (_, { headers }) => {
    const accessToken = await getAccessTokenAsync();

    return {
      headers: {
        ...headers,
        authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    };
  });

  const wsLink = process.browser
    ? new WebSocketLink({
        uri: config.wsgqlUrl,
        options: {
          reconnect: true,
          connectionParams: async () => {
            const accessToken = await getAccessTokenAsync();

            return {
              accessToken
            };
          }
        }
      })
    : null;

  const restLink = new RestLink({
    uri: 'https://api.twitch.tv/helix/',
    headers: {
      'Client-ID': config.twitchClientId,
      Accept: 'application/vnd.twitchtv.v5+json'
    },
    endpoints: {
      helix: 'https://api.twitch.tv/helix/',
      kraken: 'https://api.twitch.tv/kraken/'
    }
  });

  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: process.browser
      ? split(
          ({ query }) => {
            // @ts-ignore
            const { kind, operation } = getMainDefinition(query);
            return (
              kind === 'OperationDefinition' && operation === 'subscription'
            );
          },
          wsLink,
          authLink.concat(restLink).concat(httpLink)
        )
      : authLink.concat(restLink).concat(httpLink),
    cache: new InMemoryCache().restore(initialState || {})
  });
}

export default function initApollo(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}
