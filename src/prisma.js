import {Prisma} from 'prisma-binding';

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://192.168.99.100:4466'
});

const updatePostForUser = async (postId , data) => {

  const postExists = await prisma.exists.Post({
    id: postId
  });

  if(!postExists) {
    throw new Error(`Post ${postId} does not exist.`);
  }

  const updatedPost = await prisma.mutation.updatePost({
    where: {
      id: postId
    },
    data
  } , '{author {id name email posts{id title body published}}}');
  return updatedPost.author;
};

updatePostForUser("cjrrj95ql002i0711l250pvma" , {
  title: "Prisma post 2nd update",
  published: false
}).then((user) => {
  console.log(JSON.stringify(user, undefined , 2));
}).catch((err) => {
  console.log(err);
});



// const createPostForUser = async (authorId, data) => {

//   const userExists = await prisma.exists.User({
//     id: authorId
//   });

//   if(!userExists) {
//     throw new Error(`User ${authorId} does not exist.`);
//   }

//   const post = await prisma.mutation.createPost({
//     data: {
//       ...data,
//       author: {
//         connect : {
//           id: authorId
//         }
//       }
//     }
//   } , '{author{id name email posts {id title published}}}');
//   return post.author;
// }

// createPostForUser("cjrriqti8001f071134qjtkvw" , {
//   title: 'Great books to read - Part 3',
//   body: 'The war of Art part 3',
//   published: true
// }).then((user) => {
//   console.log(JSON.stringify(user , undefined , 2));
// }).catch((err) => {
//   console.log(err);
// });

