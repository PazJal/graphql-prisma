import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '../../src/prisma';


const userOne = {
  input: {
    name: 'Jen',
    email: 'jen@example.com',
    password: bcrypt.hashSync('qweqweqwe')
  },
  user: undefined,
  jwt: undefined
};

const postOne = {
  input: {
    title: 'This is public news!',
    body: 'The original post',
    published: true
  },
  post: undefined
};

const postTwo = {
  input: {
    title: 'This is private news!',
    body: 'The original post',
    published: false,
  },
  post: undefined
};




const seedDatabase = async () => {
  // Delete test data
  await prisma.mutation.deleteManyPosts();
  await prisma.mutation.deleteManyUsers();

  //Create userOne
  userOne.user = await prisma.mutation.createUser({
    data: {
      name: 'Jen',
      email: 'jen@example.com',
      password: bcrypt.hashSync('qweqweqwe')
    }
  });
  
  const userId = userOne.user.id;
  userOne.jwt = jwt.sign({userId}, process.env.JWT_SECRET);

  //Create postOne
  postOne.post = await prisma.mutation.createPost({
    data: {
      ...postOne.input,
      author: {
        connect: {
          id: userId
        }
      }
    }
  });

  //Create postTwo
  postTwo.post = await prisma.mutation.createPost({
    data: {
      ...postTwo.input,
      author: {
        connect: {
          id: userId
        }
      }
    }
  });
};

export {seedDatabase as default, userOne, postOne, postTwo};