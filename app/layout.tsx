import "./globals.css"

import { ReactNode } from "react"

import { PresenceProvider } from "@/lib/PresenceContext"
import { UserProvider } from "@/lib/UserContext"
import { UserDataProvider } from "@/lib/UserDataContext"

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {

  return (

    <html lang="en">

      <body suppressHydrationWarning>

        <PresenceProvider>

          <UserProvider>

            <UserDataProvider>

              {children}

            </UserDataProvider>

          </UserProvider>

        </PresenceProvider>

      </body>

    </html>

  )

}