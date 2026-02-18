import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.API_URL || 'http://localhost:8080';

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      permissions?: string[];
      profileComplete?: boolean;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    userId?: number;
    role?: string;
    permissions?: string[];
    profileComplete?: boolean;
  }
}

interface ExtendedUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  userId?: number;
  role?: string;
  permissions?: string[];
  profileComplete?: boolean;
  accessToken?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          });
          const data = await res.json();
          if (res.ok && data) {
            return {
              id: credentials.email,
              email: credentials.email,
              name: data.user?.name,
              userId: data.user?.id,
              role: data.user?.role,
              permissions: data.user?.permissions ?? [],
              profileComplete: data.user?.profileComplete ?? false,
              accessToken: data.access_token
            };
          }
        } catch (e) {
          console.error('Login error:', e);
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: account.providerAccountId
            }),
            headers: { "Content-Type": "application/json" }
          });
          
          const data = await res.json();
          
          if (res.ok && data.access_token) {
            const extendedUser = user as ExtendedUser;
            extendedUser.accessToken = data.access_token;
            extendedUser.userId = data.user?.id;
            extendedUser.role = data.user?.role || undefined;
            extendedUser.permissions = data.user?.permissions ?? [];
            extendedUser.profileComplete = data.user?.profileComplete ?? false;
            return true;
          }
          return false;
        } catch (e) {
          console.error('Google auth error:', e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (account && user) {
        const extendedUser = user as ExtendedUser;
        token.accessToken = extendedUser.accessToken;
        token.userId = extendedUser.userId;
        token.role = extendedUser.role || undefined;
        token.permissions = extendedUser.permissions ?? [];
        token.profileComplete = extendedUser.profileComplete ?? false;
      }
      // Allow updating session from client via update()
      if (trigger === "update" && session) {
        if (session.profileComplete !== undefined) {
          token.profileComplete = session.profileComplete;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (session.user) {
        session.user.id = token.userId as number;
        session.user.role = token.role as string;
        session.user.permissions = (token.permissions as string[]) ?? [];
        session.user.profileComplete = token.profileComplete as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
