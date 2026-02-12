import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from "@/lib/context/auth-context"
import { RouteGuard } from "@/components/auth/route-guard"
import { TechniciansProvider } from "@/lib/context/technicians-context"
import { CustomersProvider } from "@/lib/context/customers-context"
import { InventoryProvider } from "@/lib/context/inventory-context"

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ServicePro - Gestion de Servicios en Campo',
  description: 'Panel de control para gestion de servicios en campo, ordenes de trabajo y despacho de tecnicos.',
}

export const viewport: Viewport = {
  themeColor: '#2e4a9e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthProvider>
          <RouteGuard>
            <TechniciansProvider>
              <CustomersProvider>
                <InventoryProvider>{children}</InventoryProvider>
              </CustomersProvider>
            </TechniciansProvider>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
