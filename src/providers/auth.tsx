import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify, ResourcesConfig } from "aws-amplify";

console.log(import.meta.env);
const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID!,
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID!,
      loginWith: {
        email: true,
        oauth: {
          domain: import.meta.env.VITE_COGNITO_OAUTH_DOMAIN!,
          redirectSignIn: [import.meta.env.VITE_COGNITO_REDIRECT_URI!],
          redirectSignOut: [import.meta.env.VITE_COGNITO_SIGNOUT_URI!],
          responseType: "code",
          scopes: ["openid", "profile"],
          providers: ["Google"],
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
};

Amplify.configure(amplifyConfig);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
