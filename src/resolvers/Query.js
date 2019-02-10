const Query = {
  me() {
    return {
      id: '123098',
      name: 'Mike',
      email: 'Mike@example.com'
    }
  },

  post() {
    return {
      id: '1234',
      title: 'My Post',
      body: 'Im talking about my post, my post',
      published: 1998
    }
  },

  posts(parent , args , {prisma} , info) {
    const opArgs = {};
    if(args.query){
      opArgs.where = {
        OR: [
          {
            title_contains: args.query
          },
          {
            body_contains: args.query
          }
        ]
      }
    }
    return prisma.query.posts(opArgs, info);
  },

  users(parent , args , {prisma} , info) {
    const opArgs = {};
    
    if(args.query){
      opArgs.where = {
        OR: [
          {
            name_contains: args.query
          },
          {
            email_contains: args.query
          }
        ]
      }
    }

    return prisma.query.users(opArgs, info);
  },

  comments(parent , args , {prisma} , info) {
    const {query} = args;
    const opArgs = {};
    if (query) {
      opArgs.where = {
        text_contains: query
      }
    }
    return prisma.query.comments(opArgs, info);
  }
};

export {Query as default};