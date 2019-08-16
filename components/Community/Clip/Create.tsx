import gql from 'graphql-tag';
import { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import { useRouter } from '../../../hooks/useRouter';
import { Button, Input, SWRow, TwitchClipPlayer } from '../../../ui';
import { parseSource } from '../../../utils/parseSoruce';
import config from '../../../config';

const CREATE_COMMUNITY_CLIP = gql`
  mutation createCommunityClip($input: CommunityClipCreateInput!) {
    createCommunityClip(input: $input) {
      id
      clipId
    }
  }
`;

const Box = styled.div`
  width: 600px;
`;

const Bottom = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
`;

export const CreateCommunityClip = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [clipId, setClipId] = useState('');
  const [nfws, setNfws] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [createCommunityClip] = useMutation(CREATE_COMMUNITY_CLIP, {
    onCompleted: data => {
      const communityClip = data.createCommunityClip;
      router.push(`/clip?id=${communityClip.clipId}`);
    }
  });

  const setSourceData = e => {
    const soruceData = parseSource(e.target.value);

    if (soruceData) {
      setClipId(soruceData.payload.sourceId);
    }
  };

  return (
    <Box>
      <Input
        autoFocus
        placeholder="Ссылка на Twitch клип"
        onChange={setSourceData}
      />
      <Input
        placeholder="Название"
        maxLength={100}
        onChange={e => setTitle(e.target.value)}
      />
      {clipId && <TwitchClipPlayer sourceId={clipId} />}
      <SWRow
        title="NSFW"
        description={`
              Обнажённая натура, гуро,порнография и обсценная лексика
            `}
        onChange={() => setNfws(!nfws)}
        active={nfws}
        inactiveColor={'#1D1E30'}
      />
      <SWRow
        title="Спойлер"
        description={`
              Информация о сюжете книги, фильма или компьютерной игры,
              которая, будучи преждевременно раскрытой,
              лишает некоторых читателей части удовольствия от сюжета.
            `}
        onChange={() => setSpoiler(!spoiler)}
        active={spoiler}
        inactiveColor={'#1D1E30'}
      />
      <Bottom>
        <Button
          onClick={() =>
            createCommunityClip({
              variables: {
                input: {
                  communityId:
                    router.query.communityId || config.defaultCommunityId,
                  clipId,
                  title,
                  nfws,
                  spoiler
                }
              }
            })
          }
        >
          Создать
        </Button>
      </Bottom>
    </Box>
  );
};
