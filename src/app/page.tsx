import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Escape Room</h1>
        <p className="mt-4 max-w-md text-lg text-gray-600">
          Create interactive escape room quizzes for your students.
          Upload your questions and share a link.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-black px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-gray-800"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border-2 border-black px-8 py-4 text-lg font-medium transition-colors hover:bg-gray-100"
        >
          Log In
        </Link>
      </div>

      <div className="mt-8 grid max-w-2xl gap-6 text-center sm:grid-cols-3">
        <div>
          <div className="mb-2 text-3xl">1</div>
          <h3 className="font-semibold">Upload Questions</h3>
          <p className="text-sm text-gray-600">Create a .txt file with your questions</p>
        </div>
        <div>
          <div className="mb-2 text-3xl">2</div>
          <h3 className="font-semibold">Share Link</h3>
          <p className="text-sm text-gray-600">Send the unique link to students</p>
        </div>
        <div>
          <div className="mb-2 text-3xl">3</div>
          <h3 className="font-semibold">Track Progress</h3>
          <p className="text-sm text-gray-600">See who completed the escape room</p>
        </div>
      </div>
    </div>
  )
}
