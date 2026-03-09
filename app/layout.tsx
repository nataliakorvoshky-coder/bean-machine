import "./globals.css"
import { PresenceProvider } from "@/lib/PresenceContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body suppressHydrationWarning>

        {/* Global realtime presence */}

        <PresenceProvider>
          {children}
        </PresenceProvider>

      </body>
    </html>
  )

}