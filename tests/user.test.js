import 'cross-fetch/polyfill';
import {gql} from 'apollo-boost';
import prisma from '../src/prisma';

import seedDatabase, {userOne} from './utils/seedDatabase';
import getClient from './utils/getClient';


const client = getClient();

beforeEach(seedDatabase);

test('should create a new user.' , async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "Andrew",
          email: "andrew@example.com",
          password: "qweqweqwe"
        }
      ) {
        token,
        user {
          id
        }
      }
    }
  `;

  const response = await client.mutate({
    mutation: createUser
  });

  const userExists = await prisma.exists.User({
    id: response.data.createUser.user.id
  });
  expect(userExists).toBe(true);

});

test('shoule expose public author profiles' , async () => {
  const getUsers = gql`
    query {
      users {
        id
        name
        email
      }
  }
  `;
  const response = await client.query({ query: getUsers});
  expect(response.data.users.length).toBe(1);
  expect(response.data.users[0].email).toBe(null);
  expect(response.data.users[0].name).toBe('Jen');
});


test('should not login with bad credentials', async () => {
  const login = gql`
    mutation {
      login(
        data: {
          email:"jen@example.com"
          password: "qweqweqwE"
        }
      ){
        token
      }
    }
    `;
  await expect(client.mutate({mutation: login})).rejects.toThrow();
});

test('should not signup with a short password', async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "Jeniffer"
          email: "jeni@example.com"
          password: "qwe"
        }
      ){
        token
      }
    }
  `;
  await expect(client.mutate({mutation: createUser})).rejects.toThrow();
});

test('Should fetch user profile', async () => {
  const client = getClient(userOne.jwt);

  const me = gql`
    query {
      me {
        id
        name
        email
      }
    }
  `;
  const {data} = await client.query({query: me});
  expect(data.me.id).toBe = userOne.user.id;
  expect(data.me.email).toBe = userOne.user.email;
  expect(data.me.name).toBe = userOne.user.name;



});