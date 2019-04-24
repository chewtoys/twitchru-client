import PostFeedView from '../components/PostHelper/FeedView';
import useRouter from '../hooks/useRouter';
import Layout from '../layouts/Main';
import PostProvider from '../providers/Post';
import styled from '../theme';

const Box = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 auto;
  padding: 20px 0;
`;

const PostBox = styled.div`
  margin: 0 20px;
  width: 800px;
  border-radius: 5px;
  overflow: hidden;
`;

const PostPage = () => {
  const router = useRouter();
  const postId = router.query.id;

  if (typeof postId !== 'string') {
    return null;
  }

  return (
    <Layout>
      <Box>
        <PostBox>
          <PostProvider id={postId}>
            {({ post }) => <PostFeedView {...post} meta />}
          </PostProvider>
        </PostBox>
      </Box>
    </Layout>
  );
};

export default PostPage;
