import getUserId from '../utils/getUserId';

const User = {
  email: {
    fragment: 'fragment userId on User { id }',
    resolve(parent , args , {request}, info) {
      const userId = getUserId(request , false);
  
      if(userId && parent.id === userId) {
        return parent.email; 
      } else {
        return null;
      }
    }
  },
  posts: {
    fragment: 'fragment userId on User {id}',
    resolve(parent, args, {prisma, request}, info){
      const userId = parent.id;

      const opArgs = {
        where: {
          author: {
            id: userId
          },
          published: true
        }
      };
      return prisma.query.posts(opArgs, info);
    }

  }
};

export {User as default};