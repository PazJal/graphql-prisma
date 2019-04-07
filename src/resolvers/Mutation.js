import bcrypt from 'bcryptjs';

import hashPassword from '../utils/hashPassword';
import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';

const Mutation = {
  async login(parent, args, {prisma}, info) {
    const {email , password} = args.data;
    const user = await prisma.query.user({
      where: {
        email
      }
    });

    if(!user) {
      throw new Error(`No match found for ${email}`);
    }

    const userVerified = await bcrypt.compare(password, user.password);

    if(!userVerified){
      throw new Error(`Password verification faild.`);
    }

    return {
      user,
      token: generateToken(user.id)
    }
  },


  async createUser(parent , args , {prisma} , info) {
    const {email,password} = args.data;

    const hashedPassword = await hashPassword(password);
    const emailTaken = await prisma.exists.User({email});
    
    if(emailTaken) {
      throw new Error(`Email ${email} is already in use.`);
    }

    const user =  await prisma.mutation.createUser({
      data: {
        ...args.data,
        password: hashedPassword
      }
    });

    return {
      user,
      token: generateToken(user.id)
    }

  },

  async deleteUser(parent, args, {prisma, request}, info) {
    const userId = getUserId(request);

    return await prisma.mutation.deleteUser(
      {
        where: {
          id: userId
        }
      } , info);
  },

  async updateUser(parent, args, {prisma , request}, info) {
    const userId = getUserId(request);
    const {data} = args;

    if(typeof args.data.password === 'string'){
      args.data.password = await hashPassword(data.password);
    }

    return await prisma.mutation.updateUser({
      where: {
        id: userId
      },
      data
    },info);
  },

  async createPost(parent ,args, {prisma, request}, info) {
    const userId = getUserId(request);
    

    return await prisma.mutation.createPost({
      data: {
        ...args.data,
        author: {
          connect: {
            id: userId
          }
        }
      }
    } , info);
  },
 
  async deletePost(parent, args, {prisma, request}, info) {
    const {id} = args;
    const userId = getUserId(request);
    const postExists = await prisma.exists.Post({
      id,
      author: {
        id: userId
      }
    });

    if(!postExists){
      throw new Error(`Post ${id} not found or does not belong to user.`);
    }

    return await prisma.mutation.deletePost({
      where: {
        id
      }
    }, info);
  },

  async updatePost(parent, args, {prisma, request}, info) {
    const {id, data} = args;
    const userId = getUserId(request);
    const postExists = await prisma.exists.Post({
      id,
      author: {
        id: userId
      }
    });

    if(!postExists) {
      throw new Error(`Post ${id} not found or does not belong to user.`);
    }
    //Check if post is published
    const postPublished = await prisma.exists.Post({
      id,
      published: true
    });

    if( postPublished && data.published === false) {
      prisma.mutation.deleteManyComments({
        where: {
          post: {
            id
          }
        }
      });
    }

    return await prisma.mutation.updatePost({
      where: {
        id
      },
      data
    }, info);
  },

  async createComment(parent, args, {prisma , request}, info){
    const {post , text} = args.data;
    const userId = getUserId(request);
    const postExists = await prisma.exists.Post({
      id: post,
      published: true
    });

    if (!postExists) {
      throw new Error(`Post does not exist or is not public.`);
    }


    return await prisma.mutation.createComment({
      data: {
        text,
      author: {
        connect: {
          id:userId
        }
      },
      post: {
        connect: {
          id: post
        }
      }
    }  
    },info);
  },

  async deleteComment(parent ,args, {prisma, request}, info) {
    const userId = getUserId(request);
    const {id} = args;
    const commentExistsWithAuthor = await prisma.exists.Comment({
      id,
      author: {
        id: userId
      }
    });
    if(!commentExistsWithAuthor) {
      throw new Error(`There is no comment with that id that belongs to user.`);
    }

    return await prisma.mutation.deleteComment({
      where: {
        id
      }
    },info);
  },

  async updateComment(parent, args, {prisma, request}, info){
    const {id, data} = args;
    const userId = getUserId(request);
    const commentExistsWithAuthor = await prisma.exists.Comment({
      id,
      author: {
        id: userId
      }
    });
    if(!commentExistsWithAuthor) {
      throw new Error(`There is no comment with that id that belongs to user.`);
    }
    return await prisma.mutation.updateComment({
      where: {
        id
      },
      data
    }, info);
  }
}

export {Mutation as default};