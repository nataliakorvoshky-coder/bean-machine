"use client"

import { useRouter } from "next/navigation"

export default function HomePage() {

  const router = useRouter()

  return (

    <main className="min-h-screen bg-emerald-100 flex items-center justify-center">

      <div className="flex w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden bg-white">

        {/* LEFT LOGIN PANEL */}

        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center">

          <img
            src="/logo.png"
            className="w-20 mb-6"
          />

          <h1 className="text-3xl font-bold text-emerald-700 mb-6">
            Bean Machine
          </h1>

          <button
            onClick={()=>router.push("/login")}
            className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600"
          >
            Login
          </button>

        </div>


        {/* RIGHT IMAGE PANEL */}

        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: "url('/coffee.jpg')"
          }}
        />

      </div>

    </main>

  )
}