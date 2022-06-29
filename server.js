import { ApolloServer, gql } from "apollo-server";

let tweets = [
    {
        id: "1",
        text: "first one!",
    },
    {
        id: "2",
        text: "second one",
    },
];

let users = [
    {
        id: "1",
        firstName: "nico",
        lastName: "las",
    },
    {
        id: "2",
        firstName: "Elon",
        lastName: "Mask",
    },
];

// data의 shape을 graphql한테 설명해줘야 한다.
const typeDefs = gql`
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        fullName: String!
    }
    type Tweet {
        id: ID!
        text: String!
        author: User
    }
    type Query {  # GET
        allTweets: [Tweet!]!  # GET /api/v1/tweets
        # id에 해당하는 하나의 Tweet을 불러온다.
        tweet(id: ID!): Tweet  # GET /api/v1/tweet/:id
        allUsers: [User!]!
    }
    type Mutation {  # POST, DELETE, PUT
        postTweet(text: String!, userId: ID!): Tweet!
        deleteTweet(id: ID!): Boolean!
    }
`;

// Apollo 서버가 resolvers 부를 때 argument를 부여
const resolvers = {
    Query: {
        allTweets() {
            return tweets;
        },
        // 두 번째 argument : query나 mutation에서 유저가 보낸 arugment
        tweet(root, { id }) {
            return tweets.find((tweet) => tweet.id === id);
        },
        allUsers() {
            return users;
        }
    },
    Mutation: {
        postTweet(_, { text, userId }) {
            const newTweet = {
                id: tweets.length + 1,
                text,
            };
            tweets.push(newTweet);
        },
        deleteTweet(_, { id }) {
            const tweet = tweets.find((tweet) => tweet.id === id);
            if (!tweet) return false;
            tweets = tweets.filter((tweet) => tweet.id !== id);
            return true;
        },
    },
    User: {
        fullName() {
            return "hello"
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
    console.log(`Running on ${url}`);
});

// 4.8 Type Resolvers 3 : 45부터