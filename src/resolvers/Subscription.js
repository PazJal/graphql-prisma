import getUserId from '../utils/getUserId';

const Subscription = {
  count: {
    subscribe(parent, args, {prisma}, info) {

      
      let count = 0;

      setInterval(() => {
        count++;
        pubsub.publish('count' , {
          count
        });
      },1000);

      return pubsub.asyncIterator('count');
    }
  },

  comment: {
    subscribe(parent, args, {prisma}, info) {
      return prisma.subscription.comment({
        where: {
          node: {
            post: {
              id: args.postId
            }
          }
        }
      },info);
      // const {postId} = args;
      // const {db , pubsub} = ctx;
      // const post = db.posts.find((post) => post.id === postId && post.published);
      // if(!post) {
      //   throw new Error(`Post ${postId} not found.`);
      // }

      // return pubsub.asyncIterator(`COMMENT/${postId}`);
    }
  },

  post: {
    subscribe(parent, args, {prisma}, info) {
      return prisma.subscription.post({
        where: {
          node: {
            published: true
          }
        }
      },info);
    }
  },

  myPost: {
    subscribe(parent, args, {prisma , request} , info){
      const userId = getUserId(request);
      return prisma.subscription.post({
        where: {
          node: {
            author: {
              id: userId
            }
          }
        }
      },info);
    }
  }
};




export {Subscription as default};