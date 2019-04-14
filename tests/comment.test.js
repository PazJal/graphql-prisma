import 'cross-fetch/polyfill';
import {deleteComment, subscribeToComments, subscribeToPosts} from './utils/operations';
import getClient from './utils/getClient';
import seedDatabase, {userOne, userTwo, commentOne, commentTwo, postOne} from './utils/seedDatabase';
import prisma from '../src/prisma';

beforeEach(seedDatabase);

const client = getClient();

test('Should delete users own comment', async () => {
  const client = getClient(userOne.jwt);
  const variables = {
    id: `${commentOne.comment.id}`
  }
  const {data} = await client.mutate({mutation: deleteComment, variables});
  const commentExists = await prisma.exists.Comment({id: variables.id});
  expect(commentExists).toBe(false);
  expect(data.deleteComment.id).toBe(variables.id);
});

test('Should not allow you to delete another users comment', async () => {
  const client = getClient(userTwo.jwt);
  const variables = {
    id: `${commentOne.comment.id}`
  }
  await expect(client.mutate({mutation: deleteComment, variables})).rejects.toThrow();
  
});

test('Should subscribe for comments to a post' , async (done) => {
  const variables = {
    postId: postOne.post.id,
  };
  client.subscribe({query: subscribeToComments , variables}).subscribe({
    next(response) {
      expect(response.data.comment.mutation).toBe('DELETED');
      done();
    }
  });

  await prisma.mutation.deleteComment({where: {id: commentOne.comment.id}});

});

test('Should subscribe for changes on post', async (done) => {
  client.subscribe({query: subscribeToPosts}).subscribe({
    next(response) {
      expect(response.data.post.mutation).toBe('DELETED');
      done();
    }
  });

  await prisma.mutation.deletePost({where: {id: postOne.post.id}});
});