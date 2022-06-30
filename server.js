import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

let tweets = [
    {
        id: "1",
        text: "first one!",
        userId: "2",  // foreign key
    },
    {
        id: "2",
        text: "second one!",
        userId: "1",  // foreign key
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
        """ Is the sum of firstName + lastName as a string """
        fullName: String!
    }
    """ Tweet object represets a resource for a Tweet """
    type Tweet {
        id: ID!
        text: String!
        author: User
    }
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
    }
    type Query {  # GET
        allTweets: [Tweet!]!  # GET /api/v1/tweets
        # id에 해당하는 하나의 Tweet을 불러온다.
        tweet(id: ID!): Tweet  # GET /api/v1/tweet/:id
        allUsers: [User!]!
        allMovies: [Movie!]!
        movie(id: String!): Movie
    }
    type Mutation {  # POST, DELETE, PUT
        postTweet(text: String!, userId: ID!): Tweet!
        """ Deletes a Tweet if found, else returns false """
        deleteTweet(id: ID!): Boolean!
    }
`;

// Apollo 서버가 resolvers 부를 때 argument를 부여
const resolvers = {
    Query: {
        allTweets() {
            return tweets;
        },
        // 두 번째 argument : query나 mutation에서 유저가 보낸 argument
        tweet(_, { id }) {
            return tweets.find((tweet) => tweet.id === id);
        },
        allUsers() {
            console.log("allUsers called!");  // User/fullName()보다 얘가 먼저 호출됨
            return users;
        },
        allMovies() {  // REST API를 가져다가 GraphQL에서 사용하기 위함
            const r = await fetch("https://yts.mx/api/v2/list_movies.json");
            const json = await r.json();
            return json.data.movies;
        },
        movie(_, { id }) {
            const r = await fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`);
            const json = await r.json();
            return json.data.movie;
        },
    },
    Mutation: {
        postTweet(_, { text, userId }) {
            const newTweet = {
                id: tweets.length + 1,
                text,
                userId
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
        fullName({ firstName, lastName }) {
            // 첫 번째 argument로 root를 불러와서 호출하면 { id: '1', firstName: 'nico', lastName: 'las"} 호출됨
            return `${firstName} ${lastName}`;
        }
    },
    Tweet: {
        author({ userId }) {  // tweets의 userId
            return users.find((user) => user.id === userId);
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
    console.log(`Running on ${url}`);
});