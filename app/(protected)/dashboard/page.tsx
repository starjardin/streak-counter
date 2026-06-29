import { StreaksList } from "./StreaksList"
import { NewStreakButton } from "./NewStreakButton"
import { DashboardTabs } from "./DashboardTabs"

export default async function DashboardPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardTabs />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Your Streaks
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your active streaks
            </p>
          </div>
          <NewStreakButton />
        </div>

        <StreaksList />
      </div>
    </>
  )
}
