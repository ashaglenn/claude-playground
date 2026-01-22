import Link from 'next/link'

export default function Home() {
  return (
    <div className="gradient-bg flex min-h-screen flex-col items-center justify-center p-8">
      {/* Hero Section */}
      <div className="glass-card max-w-2xl p-12 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Escape Room
            <span className="block text-2xl font-normal text-gray-600 mt-2">
              for Education
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Create interactive escape room quizzes that engage your students and make learning fun.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/signup" className="btn-primary text-center">
            Get Started Free
          </Link>
          <Link href="/login" className="btn-secondary text-center">
            Log In
          </Link>
        </div>

        {/* Features */}
        <div className="grid gap-6 sm:grid-cols-3 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Create Questions</h3>
            <p className="text-sm text-gray-600 mt-1">
              Multiple choice, hotspot, drag &amp; drop, and fill-in-the-blank
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Share Instantly</h3>
            <p className="text-sm text-gray-600 mt-1">
              Send a simple link to your students
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Track Progress</h3>
            <p className="text-sm text-gray-600 mt-1">
              See who completed the escape room
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-white/80 text-sm">
        Made for teachers, by teachers
      </p>
    </div>
  )
}
