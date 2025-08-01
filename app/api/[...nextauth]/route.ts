import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await db.findUserByEmail(credentials.email!)
        if (user && user.verifyPassword(credentials.password!)) {
          return { id: user.id, name: user.name, email: user.email }
        }
        return null
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      session.user!.id = token.id as string
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
