// @ts-expect-error
import "./globals.css";
import { PresenceProvider } from "@/lib/PresenceContext"
import { UserProvider } from "@/lib/UserContext"
import { UserDataProvider } from "@/lib/UserDataContext"
import GlobalSync from "@/components/GlobalSync";


// RootLayout component is the root of your app
export default function RootLayout({
  children
}: {
  children: React.ReactNode // This represents the dynamic content for different pages in the app
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {/* Global State (loads once on the root level) */}
        <PresenceProvider> {/* Provides context for real-time presence management */}
          <UserProvider> {/* Provides user authentication and data management */}
            <UserDataProvider> {/* Provides user-specific data management */}
              <GlobalSync />
              {children} {/* The dynamic content (page content) will be inserted here */}
            </UserDataProvider>
          </UserProvider>
        </PresenceProvider>
      </body>
    </html>
  )
}