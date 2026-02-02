export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to Interlingo
        </h1>
        <p className="text-gray-600 mb-8">
          AI-powered interpreter scheduling and management system
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
