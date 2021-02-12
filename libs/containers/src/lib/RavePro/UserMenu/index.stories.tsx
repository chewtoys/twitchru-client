import React from 'react';
import { WithApollo } from '@dream/utils/apollo/WithApollo';
import { UserMenu as UserMenuContainer } from './';

export default {
  title: 'Containers/RavePro',
};

export const UserMenu = () => {
  return (
    <WithApollo>
      <UserMenuContainer />
    </WithApollo>
  );
};