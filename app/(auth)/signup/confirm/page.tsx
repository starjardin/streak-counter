import Link from 'next/link'

export default function ConfirmEmailPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="text-4xl mb-4">📬</div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h1>
      <p className="text-sm text-gray-600 mb-6">
        We sent you a confirmation link. Click it to activate your account.
      </p>
      <Link href="/login" className="text-sm text-blue-600 hover:underline">
        Back to login
      </Link>
    </div>
  )
}
