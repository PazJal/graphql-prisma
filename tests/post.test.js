import 'cross-fetch/polyfill';
import {gql} from 'apollo-boost';
import prisma from '../src/prisma';

import seedDatabase, {userOne, postOne, postTwo} from './utils/seedDatabase';
import getClient from './utils/getClient';

const client = getClient();

beforeEach(seedDatabase);


test('should return only published posts', async () => {
  const getPosts = gql`
    query {
      posts {
        title
        body
        published
      }
    }
  `;

  const response = await client.query({query: getPosts});
  expect(response.data.posts.length).toBe(1);
  expect(response.data.posts[0].published).toBe(true);
  
});

test('Should return all of the users posts', async () => {
  const localClient = getClient(userOne.jwt);
  const userPosts = gql`
    query {
      myPosts {
        id
        title
        body
      }
    }
  `;
  const {data} = await localClient.query({query: userPosts});
  expect(data.myPosts.length).toBe(2);
  
});

test('Should  be able to update own posst' , async () => {
  const client = getClient(userOne.jwt);
  const updatePost = gql`
    mutation {
      updatePost(
        id: "${postOne.post.id}",
        data: {
          published: false
        }
      ){
        id
        title
        body
        published
      }
    }
  `;
  const {data} = await client.mutate({mutation: updatePost});
  const exists = await prisma.exists.Post({id: `${postOne.post.id}`, published: false});
  expect(data.updatePost.published).toBe(false);
  expect(exists).toBe(true);

});

test('Should be able to create post if authenticated', async () => {
  const client = getClient(userOne.jwt);
  const createPost = gql`
    mutation {
      createPost(
        data: {
          title: "This is a public post 2",
          body: "The original post",
          published: false,
        }
      ) {
        id
        title
        body
      }
    }
  `;
  const {data} = await client.mutate({mutation: createPost});
  const exists = await prisma.exists.Post({id: data.createPost.id});
  expect(exists).toBe(true);

});

test('Should be able to delete his own post' , async () => {
  const client = getClient(userOne.jwt);
  const deletePost = gql`
    mutation {
      deletePost(
          id: "${postTwo.post.id}"
      ){
        id
        title
        body
        published
      }
    }
  `;
  const {data} = await client.mutate({mutation: deletePost});
  const exists = await prisma.exists.Post({id: data.deletePost.id});
  expect(exists).toBe(false);
});
