import gql from 'graphql-tag';
import { Component, FC } from 'react';
import { Query } from 'react-apollo';

const GET = gql`
  query channel($where: ChannelWhereUniqueInput!) {
    channel(where: $where) {
      id
      name
      title
      avatar
      live
      cost
    }
  }
`;

const UPDATED = gql`
  subscription channel($id: ID!) {
    channel(id: $id) {
      id
      name
      title
      avatar
      live
      cost
    }
  }
`;

interface IPropsInner {
  channel: any;
  updated: () => void;
  children: any;
}

class ProviderInner extends Component<IPropsInner> {
  public componentDidMount() {
    this.props.updated();
  }

  public render() {
    return this.props.children({
      channel: this.props.channel
    });
  }
}

interface IProps {
  id: string;
}

const Provider: FC<IProps> = ({ children, id }) => (
  <Query query={GET} variables={{ where: { id } }}>
    {({ loading, error, data, subscribeToMore }) => {
      if (loading || error) {
        return null;
      }

      return (
        <ProviderInner
          channel={data.channel}
          updated={() => {
            subscribeToMore({
              document: UPDATED,
              variables: { id },
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) {
                  return prev;
                }

                return {
                  ...prev,
                  channel: {
                    ...prev.channel,
                    ...subscriptionData.data.channel
                  }
                };
              }
            });
          }}
        >
          {children}
        </ProviderInner>
      );
    }}
  </Query>
);

export default Provider;
