"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

const errorMessages: Record<string, { title: string; description: string; action?: string }> = {
  Configuration: {
    title: "Configuration Error",
    description: "There's an issue with the authentication configuration. Please contact the system administrator.",
    action: "Contact Support"
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You don't have permission to access this resource.",
    action: "Request Access"
  },
  Verification: {
    title: "Verification Required",
    description: "Please verify your email address before continuing.",
    action: "Resend Verification"
  },
  Default: {
    title: "Authentication Error",
    description: "An error occurred during authentication. Please try again.",
    action: "Try Again"
  },
  OAuthSignin: {
    title: "OAuth Sign In Error",
    description: "There was an error signing in with the OAuth provider.",
    action: "Try Again"
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "There was an error processing the OAuth callback.",
    action: "Try Again"
  },
  OAuthCreateAccount: {
    title: "Account Creation Error",
    description: "There was an error creating your account.",
    action: "Try Again"
  },
  EmailCreateAccount: {
    title: "Email Sign Up Error",
    description: "There was an error creating your account with email.",
    action: "Try Again"
  },
  Callback: {
    title: "Callback Error",
    description: "There was an error processing the authentication callback.",
    action: "Try Again"
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description: "This email is already associated with another account.",
    action: "Link Accounts"
  },
  SessionRequired: {
    title: "Session Required",
    description: "You must be signed in to access this page.",
    action: "Sign In"
  }
}

export default function AuthError() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}

function AuthErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("Default")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam && errorMessages[errorParam]) {
      setError(errorParam)
    }
  }, [searchParams])

  const errorInfo = errorMessages[error] || errorMessages.Default

  const handleAction = () => {
    setIsLoading(true)
    
    switch (error) {
      case "AccessDenied":
        router.push("/auth/signin")
        break
      case "Verification":
        // In a real app, this would trigger a verification email resend
        router.push("/auth/signin")
        break
      case "SessionRequired":
        router.push("/auth/signin")
        break
      default:
        router.push("/auth/signin")
        break
    }
    
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-red-50 flex items-center justify-center border border-red-200">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
        </motion.div>

        {/* Error Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Authentication Error
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              {errorInfo.description}
            </p>

            {/* Error Code */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">
                Error Code: <span className="font-mono text-gray-700">{error}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <motion.button
                onClick={handleAction}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>{errorInfo.action || "Try Again"}</span>
                  </div>
                )}
              </motion.button>

              <Link
                href="/auth/signin"
                className="block w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-500 mb-2">
            Need help with authentication?
          </p>
          <Link
            href="/support"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            Contact Support →
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
