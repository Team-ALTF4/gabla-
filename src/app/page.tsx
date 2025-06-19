// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Secure Interview Platform
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          The server is running. This interface is for interviewers only.
        </p>
      </div>
    </main>
  );
}