import ClientProvider from "@/components/providers/ClientProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientProvider>
      {children}
    </ClientProvider>
  )
}