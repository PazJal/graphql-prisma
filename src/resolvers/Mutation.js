import uuidv4 from 'uuid/v4';

const Mutation = {
  async createUser(parent , args , {prisma} , info) {
    const {email} = args.data;
    const emailTaken = await prisma.exists.User({email});
    
    if(emailTaken) {
      throw new Error(`Email ${email} is already in use.`);
    }

     return await prisma.mutation.createUser({data: args.data}, info);

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

  createComment(parent, args, {db , pubsub}, info){
    const {author, post} = args.data;
    const userExists = db.users.some((user) => user.id === author);
    const postPublished = db.posts.some((currentPost) => (currentPost.id === post && currentPost.published));

    if(!userExists) {
      throw new Error(`User ${author} does not exist.`);
    }
    if(!postPublished){
      throw new Error(`No published post matches: ${post}`);
    }

    const comment = {
      ...args.data,
      id: uuidv4()
    };

    db.comments.push(comment);

    pubsub.publish(`COMMENT/${post}` , {
      comment: {
        mutation: 'CREATED',
        data: comment
      }
    });

    return comment;

  },

  deleteComment(parent ,args, {db, pubsub}, info) {
    const {id} = args;
    const commentIndex = db.comments.findIndex((comment) => comment.id === id);
    if(commentIndex === -1){
      throw new Error(`Comment ${id} was not found.`);
    }

    const [deletedComment] = db.comments.splice(commentIndex , 1);
    console.log('Now deleting');
    pubsub.publish(`COMMENT/${deletedComment.post}` , {
      comment: {
        mutation: 'DELETED',
        data: deletedComment
      }
    });

    return deletedComment;
  },

  updateComment(parent, args, {db, pubsub}, info){
    const {id, data} = args;
    const comment = db.comments.find((comment) => comment.id === id);

    if(!comment) {
      throw new Error(`Comment ${id} not found`);
    }

    if(typeof data.text === 'string'){
      comment.text = data.text;
      pubsub.publish(`COMMENT/${comment.post}` , {
        comment: {
          mutation: 'UPDATED',
          data: comment
        }
      });
    }

    return comment;
  }
}

export {Mutation as default};