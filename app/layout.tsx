import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Prediction Market Explorer",
  description: "A prediction market explorer for index products",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} luxury-bg-primary text-white antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        {/* Add a script to safely handle ethereum object */}
        <Script id="ethereum-check" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              // Safely check for ethereum without redefining
              window.hasEthereum = typeof window.ethereum !== 'undefined';
            }
          `}
        </Script>
      </body>
    </html>
  )
}
