import 'cross-fetch/polyfill';
import prisma from '../src/prisma';

import seedDatabase, {userOne} from './utils/seedDatabase';
import getClient from './utils/getClient';
import {createUser, getUsers, login, me} from './utils/operations';



const client = getClient();

beforeEach(seedDatabase);



test('should create a new user.' , async () => {
  const variables = {
    data: {
      name: "Andrew",
      email: "andrew@example.com",
      password: "qweqweqwe"
    }
  }
  
  const response = await client.mutate({
    mutation: createUser,
    variables
  });

  const userExists = await prisma.exists.User({
    id: response.data.createUser.user.id
  });
  expect(userExists).toBe(true);

});

test('shoule expose public author profiles' , async () => {
  const response = await client.query({ query: getUsers});
  expect(response.data.users.length).toBe(2);
  expect(response.data.users[0].email).toBe(null);
  expect(response.data.users[0].name).toBe('Jen');
});


test('should not login with bad credentials', async () => {
  const variables = {
    data: {
      email:"jen@example.com",
      password: "qweqweqwE"
    }
  }
  
  await expect(client.mutate({mutation: login , variables})).rejects.toThrow();
});

test('should not signup with a short password', async () => {
  const variables = {
    data: {
      name: "Jeniffer",
      email: "jeni@example.com",
      password: "qwe"
    }
  }
  await expect(client.mutate({mutation: createUser, variables})).rejects.toThrow();
});

test('Should fetch user profile', async () => {
  const client = getClient(userOne.jwt);
  const {data} = await client.query({query: me});
  expect(data.me.id).toBe = userOne.user.id;
  expect(data.me.email).toBe = userOne.user.email;
  expect(data.me.name).toBe = userOne.user.name;
});