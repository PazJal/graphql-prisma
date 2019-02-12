import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
      token: jwt.sign({userId: user.id} , 'thisisasecret')
    }
  },


  async createUser(parent , args , {prisma} , info) {
    const {email,password} = args.data;

    if(password.length < 8) {
      throw new Error('Password must be 8 charcters or longer.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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
      token: jwt.sign({userId: user.id} ,'thisisasecret')
    }

  },

  async deleteUser(parent, args, {prisma}, info) {
    const {id} = args;

    const userExists = await prisma.exists.User({id});

    if(!userExists) {
      throw new Error(`User ${id} not found.`);
    }

    return await prisma.mutation.deleteUser(
      {
        where: {
          id
        }
      } , info);
  },

  async updateUser(parent, args, {prisma}, info) {
    const {id, data} = args;

    return await prisma.mutation.updateUser({
      where: {
        id
      },
      data
    },info);
  },

  async createPost(parent ,args, {prisma, pubsub}, info) {
    const {author} = args.data;
    const userExists = await prisma.exists.User({id: author});
    
   if(!userExists) {
      throw new Error(`User ${author} not found.`);
    }

    return await prisma.mutation.createPost({
      data: {
        ...args.data,
        author: {
          connect: {
            id: author
          }
        }
      }
    } , info);
  },
 
  async deletePost(parent, args, {prisma ,pubsub}, info) {
    const {id} = args;
    const postExists = await prisma.exists.Post({id});

    if(!postExists){
      throw new Error(`Post ${id} not found.`);
    }

    return await prisma.mutation.deletePost({
      where: {
        id
      }
    }, info);
  },

  async updatePost(parent, args, {prisma, pubsub}, info) {
    const {id, data} = args;
    const postExists = await prisma.exists.Post({id});
    if(!postExists) {
      throw new Error(`Post ${id} not found.`);
    }

    return await prisma.mutation.updatePost({
      where: {
        id
      },
      data
    }, info);
  },

  async createComment(parent, args, {prisma}, info){
    const {author, post , text} = args.data;

    return await prisma.mutation.createComment({
      data: {
        text,
      author: {
        connect: {
          id:author
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

  deleteComment(parent ,args, {prisma}, info) {
    const {id} = args;
    return prisma.mutation.deleteComment({
      where: {
        id
      }
    },info);
  },

  updateComment(parent, args, {prisma}, info){
    const {id, data} = args;
    return prisma.mutation.updateComment({
      where: {
        id
      },
      data
    }, info);
  }
}

export {Mutation as default};