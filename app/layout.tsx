import "./globals.css"

import { PresenceProvider } from "@/lib/PresenceContext"
import { UserProvider } from "@/lib/UserContext"
import { UserDataProvider } from "@/lib/UserDataContext"

export default function RootLayout({
  children
}:{
  children: React.ReactNode
}){

  return(

  <html lang="en">

    <body>

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