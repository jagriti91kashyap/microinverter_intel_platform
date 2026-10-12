"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function SignIn() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  )
}

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const hasAttempted = useRef(false)

  // Auto-login with demo account on page load
  useEffect(() => {
    if (hasAttempted.current) return
    hasAttempted.current = true

    const autoLogin = async () => {
      setIsLoading(true)
      try {
        const result = await signIn("credentials", {
          username: "Enphase",
          password: "demo",
          redirect: false,
        })
        if (result?.error) {
          setError("Auto-login failed. Click below to retry.")
        } else {
          setIsSuccess(true)
          setTimeout(() => { router.push(callbackUrl) }, 800)
        }
      } catch {
        setError("An error occurred. Click below to retry.")
      } finally {
        setIsLoading(false)
      }
    }

    autoLogin()
  }, [router])

  const handleRetry = async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await signIn("credentials", {
        username: "Enphase",
        password: "demo",
        redirect: false,
      })
      if (result?.error) {
        setError("Login failed. Please try again.")
      } else {
        setIsSuccess(true)
        setTimeout(() => { router.push(callbackUrl) }, 800)
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-enphase-50 via-white to-orange-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo and Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <span className="block text-2xl font-bold tracking-wide text-gray-900 mb-4">ENPHASE</span>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Microinverter Platform
          </h1>
          <p className="text-sm text-gray-500">
            Product Intelligence System
          </p>
        </motion.div>

        {/* Auto-Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card rounded-2xl shadow-apple-xl p-8"
        >
          <div className="flex flex-col items-center gap-4">
            {isLoading && (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-enphase-500 border-t-transparent rounded-full"
                />
                <span className="text-sm text-gray-600">Signing in...</span>
              </div>
            )}

            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg w-full justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-700">Redirecting to dashboard...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-3 w-full"
                >
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg w-full justify-center">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                  <motion.button
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="py-2.5 px-6 enphase-gradient text-white text-sm font-medium rounded-lg hover:opacity-90 focus:ring-2 focus:ring-enphase-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Retry Login
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
