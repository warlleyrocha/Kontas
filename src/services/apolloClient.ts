import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { Observable } from "@apollo/client/utilities";
import AsyncStorage from "@react-native-async-storage/async-storage";

const debugLink = new ApolloLink((operation, forward) => {
  const { headers } = operation.getContext();
  console.log("[GQL headers]", headers);
  return forward(operation);
});

const httpLink = new HttpLink({
  uri: "http://10.0.2.2:3333/graphql",
});

// Auth Link assíncrono
const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("@app:token");

        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
          },
        }));

        forward(operation).subscribe(observer);
      } catch (error) {
        observer.error(error);
      }
    })();
  });
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, debugLink, httpLink]),
  cache: new InMemoryCache(),
});
