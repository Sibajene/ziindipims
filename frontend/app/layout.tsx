import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import './globals.css'
import ClientLayout from './client-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZiiPro - Pharmacy Management System',
  description: 'A comprehensive pharmacy management system for African pharmacies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}