import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const sessionKey = cookieStore.get("session_key")?.value;

  if (sessionKey && sessionKey !== '') {
    debugger;
    redirect("/main");
  }

  return <>{children}</>
}