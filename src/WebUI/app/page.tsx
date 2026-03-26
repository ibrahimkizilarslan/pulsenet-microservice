import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[100svh] bg-app">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-medium tracking-wide text-white/70">
              PulseNet • Gateway-backed UI
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Twitter-benzeri mikroservis uygulaman için UI
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/70">
              Bu arayüz `PulseNet.Gateway` üzerinden `/api/auth`, `/api/users`,
              `/api/posts`, `/api/follows`, `/api/timeline` endpointlerine konuşur.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-primary" href="/login">
              Giriş yap
            </Link>
            <Link className="btn btn-secondary" href="/register">
              Kayıt ol
            </Link>
            <Link className="btn btn-ghost" href="/home">
              Ana akışa git
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="card">
              <div className="card-title">Home / Timeline</div>
              <div className="card-body">`GET /api/timeline/{`{userId}`}`</div>
            </div>
            <div className="card">
              <div className="card-title">Explore / Recent</div>
              <div className="card-body">`GET /api/posts/recent`</div>
            </div>
            <div className="card">
              <div className="card-title">Profile</div>
              <div className="card-body">`GET /api/users/by-username/{`{username}`}`</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
