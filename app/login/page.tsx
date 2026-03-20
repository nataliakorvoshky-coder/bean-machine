"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Check if the user is already logged in when the component mounts
useEffect(() => {
  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error checking session:", error);
      return;
    }
    
    if (session) {
      // Log the session role for debugging
      console.log("Session Role:", session.user.role);
      
      // Check user role
      await checkUserRole(session.user.id);
    }
  };

  checkSession();
}, []);

  // Fetch user role from the user_roles table
  const checkUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error("Error fetching user role:", error)
      return
    }

    if (data && data.role_id === 'admin') {
      // If the role is 'admin', redirect to the admin page
      router.push("/admin")
    } else {
      // Redirect to a different page (non-admin user)
      router.push("/dashboard")
    }
  }

  // Handle login form submission
  async function login(e: any) {
    e.preventDefault()

    setLoading(true)
    setError("")  // Reset any previous error

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) {
      setError(error.message) // Set error message if there's an error
      return
    }

    // Store user info in cookies or localStorage for session management
    document.cookie = `user_id=${data.user.id}; path=/`

    // After login, check the user role and redirect
    await checkUserRole(data.user.id)  // This will handle the redirection after login
  }

  return (
    <main className="min-h-screen bg-emerald-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[420px]">

        <h1 className="text-3xl font-bold text-center text-emerald-600 mb-10">
          Login
        </h1>

        {error && <div className="mb-4 text-red-500 text-center">{error}</div>} {/* Show error message */}

        <form onSubmit={login} className="space-y-6">

          <div>
            <label className="block text-emerald-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-emerald-400 bg-white text-black p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div>
            <label className="block text-emerald-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-emerald-400 bg-white text-black p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-500 text-white p-3 rounded w-full hover:bg-emerald-600"
            disabled={loading} // Disable button when loading
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </main>
  )
}