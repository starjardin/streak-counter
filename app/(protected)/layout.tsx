import { createClient } from "@/lib/supabase/server"
import { isCurrentUserAdmin } from "@/lib/db/users"
import { NavigationShell } from "@/components/NavigationShell"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let displayName = authUser?.email ?? "User"
  if (authUser) {
    const { data: profile } = await supabase
      .from("users")
      .select("username")
      .eq("id", authUser.id)
      .single()
    if (profile?.username) {
      displayName = profile.username
    }
  }

  const admin = await isCurrentUserAdmin()

  return (
    <NavigationShell displayName={displayName} isAdmin={admin}>
      {children}
    </NavigationShell>
  )
}
