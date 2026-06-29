import { connection } from "next/server"
import { getJournalEntries, getDatesWithEntries } from "@/lib/db/journal-entries"
import { JournalPage } from "./JournalPage"
import { DashboardTabs } from "../DashboardTabs"

export default async function JournalPageServer() {
  await connection()
  const today = new Date().toISOString().slice(0, 10)
  const [datesWithEntries, todayEntries] = await Promise.all([
    getDatesWithEntries(),
    getJournalEntries(today),
  ])

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardTabs />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <JournalPage
          datesWithEntries={datesWithEntries}
          todayEntries={todayEntries}
        />
      </div>
    </>
  )
}
