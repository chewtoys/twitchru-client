import gql from 'graphql-tag';
import { FC } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Icon, Button } from '../../../ui';
import { useRouter } from '../../../hooks/useRouter';
import { useAccess } from '../../../hooks/useAccess';
import * as LeftMenu from '../../../ui/LeftMenu';
import styled from 'styled-components';
import config from '../../../config';

const GET_USER_TWITCH_FOLLOWS = gql`
  query twitchFollows($after: String, $first: Int) {
    twitchFollows(after: $after, first: $first) {
      total
      data {
        to_name
        to_id
      }
      pagination {
        cursor
      }
    }
  }
`;

const FollowsGuest = styled.div`
  font-size: 13px;
  text-align: center;
  padding: 10px 20px;
  color: ${({ theme }) => theme.accent2Color};
`;

const FollowsGuestText = styled.div`
  padding: 5px 0;
`;

const FollowsGuestAction = styled.div`
  margin: 10px 0;
`;

const FIRST_SIZE = 10;
const PAGE_SIZE = 50;

const FollowsInner = () => {
  const router = useRouter();

  const { loading, error, data, fetchMore, refetch } = useQuery(
    GET_USER_TWITCH_FOLLOWS,
    { variables: { first: FIRST_SIZE, after: undefined } }
  );

  if (error || !data || !data.twitchFollows) {
    return null;
  }

  const follows = data.twitchFollows.data;
  const total = data.twitchFollows.total;
  const currentCount = data.twitchFollows.data.length;
  const hasMore = total - currentCount > 0;

  const hasLess = !hasMore && total > FIRST_SIZE && currentCount > FIRST_SIZE;

  const moreFollows = () => {
    fetchMore({
      variables: {
        after: data.twitchFollows.pagination.cursor,
        first: PAGE_SIZE
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return {
          twitchFollows: {
            ...fetchMoreResult.twitchFollows,
            data: [
              ...prev.twitchFollows.data,
              ...fetchMoreResult.twitchFollows.data
            ]
          }
        };
      }
    });
  };

  return (
    <LeftMenu.Item
      route="/channel"
      icon="favorite"
      title="Подписки"
      badge={total}
      noClick
      showContentAlways
    >
      {follows.map(channel => (
        <LeftMenu.SubItem
          route={`/channel?id=${channel.to_id}`}
          active={
            router.route === '/channel' && router.query.id === channel.to_id
          }
          key={channel.to_id}
        >
          {channel.to_name}
        </LeftMenu.SubItem>
      ))}
      {hasMore && (
        <LeftMenu.LoadMore onClick={() => moreFollows()}>
          {loading ? 'Загрузка...' : <Icon type="chevron-down" />}
        </LeftMenu.LoadMore>
      )}
      {hasLess && (
        <LeftMenu.LoadMore onClick={() => refetch()}>
          <Icon type="chevron-up" />
        </LeftMenu.LoadMore>
      )}
    </LeftMenu.Item>
  );
};

export const Follows: FC = () => {
  const [{ allow: isUser, loading }] = useAccess();

  if (loading) {
    return (
      <LeftMenu.Item
        route="/channel"
        icon="favorite"
        title="Подписки"
        noClick
        showContentAlways
      >
        {[...new Array(7)].map((...args) => (
          <LeftMenu.SubItemSkeleton key={args[1]} />
        ))}
      </LeftMenu.Item>
    );
  }

  if (!isUser) {
    return (
      <LeftMenu.Item
        route="/channel"
        icon="favorite"
        title="Подписки"
        noClick
        showContentAlways
      >
        <FollowsGuest>
          <FollowsGuestText>
            Войдите через Twitch чтобы видеть список своих подписок
          </FollowsGuestText>
          <FollowsGuestAction>
            <a href={`${config.apiUrl}auth/twitch`}>
              <Button>Войти</Button>
            </a>
          </FollowsGuestAction>
        </FollowsGuest>
      </LeftMenu.Item>
    );
  }

  return <FollowsInner />;
};
