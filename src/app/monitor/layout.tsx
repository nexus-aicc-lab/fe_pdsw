import ClientProvider from "@/components/providers/ClientProvider";
export default function MonitorLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <ClientProvider>{children}</ClientProvider>;
  }