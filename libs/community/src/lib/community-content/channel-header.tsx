import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useChannelQuery } from '@dream/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CogIcon } from '@heroicons/react/solid';
import { channelMods } from '../channel-mods';

export const ChannelHeader = () => {
  const router = useRouter();
  const name =
    typeof router.query?.channel === 'string' && router.query?.channel;

  const isUser = true;

  const channelQuery = useChannelQuery({
    variables: { name },
    skip: !name,
  });

  const channel = channelQuery?.data?.channel;
  const mode = channelMods.find((m) => m?.value === channel?.mode);

  return (
    <div className="flex flex-shrink-0 w-full bg-background-light text-white h-10 px-4">
      {mode?.icon && (
        <div className="h-full flex items-center text-sm mr-4">
          <FontAwesomeIcon icon={mode?.icon} className={`${mode?.color} h-4`} />
        </div>
      )}
      <div className="h-full flex flex-1 items-center text-sm">
        {channel?.title}
      </div>
      {isUser && (
        <div className="h-full flex items-center ml-4">
          <Link
            href={{
              pathname: router.route,
              query: {
                ...router.query,
                channelSettings: 'overview',
              },
            }}
            passHref
          >
            <a
              href="replace"
              className="h-8 w-8 rounded hover:bg-surface-light flex items-center justify-center"
            >
              <CogIcon className="w-4 h-4 text-accent" aria-hidden="true" />
            </a>
          </Link>
        </div>
      )}
    </div>
  );
};
