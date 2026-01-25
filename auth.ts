import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { Role } from "@/app/generated/prisma";

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid email or password";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidLoginError();
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            company: true,
            applicant: true,
          },
        });

        if (!user || !user.passwordHash) {
          throw new InvalidLoginError();
        }

        // Verify password
        const isValidPassword = await compare(password, user.passwordHash);
        if (!isValidPassword) {
          throw new InvalidLoginError();
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name:
            user.role === "COMPANY"
              ? user.company?.name
              : user.applicant?.fullName,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign-in (Google, LinkedIn)
      if (account?.provider === "google" || account?.provider === "linkedin") {
        if (!user.email) {
          return false;
        }

        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // For OAuth, we'll need to determine role somehow
            // For now, default to APPLICANT role
            // You might want to add a role selection step after OAuth
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                role: Role.APPLICANT,
                applicant: {
                  create: {
                    fullName: user.name || "Unknown User",
                  },
                },
              },
            });

            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }

          return true;
        } catch (error) {
          console.error("Error during OAuth sign-in:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
