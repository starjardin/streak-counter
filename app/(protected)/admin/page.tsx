import { notFound } from "next/navigation";
import Link from "next/link";
import { isCurrentUserAdmin, getAllUsers } from "@/lib/db/users";

export default async function AdminPage() {
  const admin = await isCurrentUserAdmin();
  if (!admin) notFound();

  const users = await getAllUsers();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Users ({users.length})
        </h2>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Username</th>
                <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 font-medium text-gray-600">Pro</th>
                <th className="px-4 py-3 font-medium text-gray-600">Passed Trial</th>
                <th className="px-4 py-3 font-medium text-gray-600">Admin</th>
                <th className="px-4 py-3 font-medium text-gray-600">Sign up date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{user.username || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-900">{user.email}</td>
                  <td className="px-4 py-3">{user.is_pro
                    ? <span className="text-green-700 font-medium">Yes</span>
                    : <span className="text-gray-400">No</span>
                  }</td>
                  <td className="px-4 py-3">{user.passed_free_trial
                    ? <span className="text-gray-700 font-medium">Yes</span>
                    : <span className="text-blue-600 font-medium">No</span>
                  }</td>
                  <td className="px-4 py-3">{user.is_admin
                    ? <span className="text-green-700 font-medium">Yes</span>
                    : <span className="text-gray-400">No</span>
                  }</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
