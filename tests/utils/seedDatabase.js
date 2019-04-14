import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '../../src/prisma';

//Seed users
const userOne = {
  input: {
    name: 'Jen',
    email: 'jen@example.com',
    password: bcrypt.hashSync('qweqweqwe')
  },
  user: undefined,
  jwt: undefined
};

const userTwo = {
  input: {
    name: 'Kevin',
    email: 'kevin@example.com',
    password: bcrypt.hashSync('qweqweqwe')
  },
  user: undefined,
  jwt: undefined
};


//Seed posts
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

//Seed comments
const commentOne = {
  input: {
    text: 'This is comment one original'
  },
  comment: undefined
}

const commentTwo = {
  input: {
    text: 'This is comment two original'
  },
  comment: undefined
}




const seedDatabase = async () => {
  // Delete test data
  await prisma.mutation.deleteManyComments();
  await prisma.mutation.deleteManyPosts();
  await prisma.mutation.deleteManyUsers();

  //Create userOne
  userOne.user = await prisma.mutation.createUser({
    data: {
      ...userOne.input
    }
  });
  const userId = userOne.user.id;
  userOne.jwt = jwt.sign({userId}, process.env.JWT_SECRET);

  //Create userTwo
  userTwo.user = await prisma.mutation.createUser({
    data: {
      ...userTwo.input
    }
  });
  const userTwoId = userTwo.user.id;
  userTwo.jwt = jwt.sign({userId: userTwoId}, process.env.JWT_SECRET);

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

  
  //Create comment:
  commentOne.comment = await prisma.mutation.createComment({
    data: {
      ...commentOne.input,
      author: {
        connect: {
          id: userId
        }
      },
      post: {
        connect: {
          id: postOne.post.id
        }
      }
    }
  });

  commentTwo.comment = await prisma.mutation.createComment({
    data: {
      ...commentTwo.input,
      author: {
        connect: {
          id: userTwoId
        }
      },
      post: {
        connect: {
          id: postOne.post.id
        }
      }
    }
  });

};


export {seedDatabase as default, userOne,userTwo, postOne, postTwo, commentOne, commentTwo};