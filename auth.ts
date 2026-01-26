import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { Role } from "@/app/generated/prisma";
import { loginFormSchema } from "./schemas";

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
      async authorize(credentials) {
        try {
          // Validate credentials using Zod schema
          const validatedData = loginFormSchema.parse({
            email: credentials?.email,
            password: credentials?.password,
          });

          const { email, password } = validatedData;

          // Find user by email with related data
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              company: true,
              applicant: true,
            },
          });

          // Check if user and passwordHash exist BEFORE comparing
          if (!user || !user.passwordHash) {
            throw new InvalidLoginError();
          }

          const isValidPassword = await compare(password, user.passwordHash);

          if (!isValidPassword) {
            throw new InvalidLoginError();
          }

          // Return user object with all required data for session
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            image: user.image,
            name:
              user.role === "COMPANY"
                ? user.company?.name
                : user.applicant?.fullName,
          };
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Authorization error:", error);
          }
          throw new InvalidLoginError();
        }
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
            include: {
              company: true,
              applicant: true,
            },
          });

          if (!existingUser) {
            // For OAuth, we'll need to determine role somehow
            // For now, default to APPLICANT role
            // You might want to add a role selection step after OAuth
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                image: user.image,
                role: Role.APPLICANT,
                applicant: {
                  create: {
                    fullName: user.name || "Unknown User",
                  },
                },
              },
            });

            // Set user data for JWT
            user.id = newUser.id;
            user.role = newUser.role;
            user.name = user.name || "Unknown User";
          } else {
            // Update image if user exists and it changed
            if (user.image && existingUser.image !== user.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: user.image },
              });
            }

            // Set user data from database for JWT
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.name =
              existingUser.role === "COMPANY"
                ? existingUser.company?.name
                : existingUser.applicant?.fullName;
          }

          return true;
        } catch (error) {
          // Don't log sensitive errors in production
          if (process.env.NODE_ENV === "development") {
            console.error("Error during OAuth sign-in:", error);
          }
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string;
        session.user.role = token.role as Role;
        session.user.image = token.picture as string | null;
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
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  },
});
