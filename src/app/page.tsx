'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const { 
    analytics, 
    isLoading, 
    error, 
    fetchAnalytics, 
    fetchTopics, 
    fetchBlogPosts 
  } = useAppStore()

  useEffect(() => {
    fetchAnalytics()
    fetchTopics()
    fetchBlogPosts()
  }, [fetchAnalytics, fetchTopics, fetchBlogPosts])

  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FitGlide</h1>
                <p className="text-xs text-gray-500">Marketing Hub</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="#download" className="text-gray-600 hover:text-gray-900 transition-colors">Download</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="/campaigns" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Launch App</Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="#features" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#download" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Download</Link>
              <Link href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/campaigns" className="block px-3 py-2 bg-blue-600 text-white rounded-lg">Launch App</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Dominate Fitness
              </span>
              <br />Marketing Like a Pro
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The only marketing platform built specifically for fitness professionals. 
              Create campaigns, research keywords, and grow your fitness business with strategic content.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/campaigns"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 Launch FitGlide Now
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-colors">
                📱 Download Mobile App
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-600 mr-2">1000+</span>
                <span>Fitness Professionals</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-green-600 mr-2">50K+</span>
                <span>Keywords Researched</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-purple-600 mr-2">100+</span>
                <span>Campaigns Created</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to <span className="text-blue-600">Grow Your Fitness Business</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop creating random content. Start with strategy, research with intelligence, and create with purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Campaign-First Strategy</h3>
              <p className="text-gray-600">
                Create strategic campaigns with clear objectives, target audiences, and measurable KPIs. No more random content!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔍 Fitness Keyword Intelligence</h3>
              <p className="text-gray-600">
                Google Autocomplete + Trends integration with 25+ fitness modifiers. Find trending keywords that convert.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Performance Analytics</h3>
              <p className="text-gray-600">
                Track campaign performance, keyword rankings, and content ROI. Make data-driven decisions that grow your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section id="download" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            📱 Get FitGlide on Your Phone
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Create campaigns, research keywords, and manage your fitness marketing on the go. 
            Never miss an opportunity to grow your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-black text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-3 hover:bg-gray-800 transition-colors">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-lg font-bold">App Store</div>
              </div>
            </button>

            <button className="bg-black text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-3 hover:bg-gray-800 transition-colors">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">Get it on</div>
                <div className="text-lg font-bold">Google Play</div>
              </div>
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">🎪 Why Choose FitGlide Mobile?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-4xl mb-2">⚡</div>
                <h4 className="font-semibold mb-2">Lightning Fast</h4>
                <p className="text-sm opacity-90">Create campaigns and research keywords in seconds, not hours.</p>
              </div>
              <div>
                <div className="text-4xl mb-2">📱</div>
                <h4 className="font-semibold mb-2">Mobile Optimized</h4>
                <p className="text-sm opacity-90">Full functionality designed specifically for mobile use.</p>
              </div>
              <div>
                <div className="text-4xl mb-2">🔔</div>
                <h4 className="font-semibold mb-2">Smart Notifications</h4>
                <p className="text-sm opacity-90">Get alerts about trending keywords and campaign performance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            💎 Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Start free, upgrade when you're ready to dominate the fitness market.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🌱 Starter</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                FREE
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  3 Campaigns
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic Keyword Research
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Community Support
                </li>
              </ul>
              <Link href="/campaigns" className="block bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-8 transform scale-105 shadow-xl">
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                🏆 Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">💪 Pro</h3>
              <div className="text-4xl font-bold mb-6">
                $29
                <span className="text-lg font-normal opacity-80">/month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Unlimited Campaigns
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Advanced Keyword Intelligence
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Competitor Analysis
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Priority Support
                </li>
              </ul>
              <Link href="/campaigns" className="block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Pro Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🚀 Enterprise</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $99
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Team Collaboration
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Custom Integrations
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Dedicated Success Manager
                </li>
              </ul>
              <Link href="/campaigns" className="block bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Dominate Fitness Marketing? 🏆
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join 1000+ fitness professionals who've transformed their marketing strategy with FitGlide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/campaigns"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚀 Start Your Journey
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors">
              📱 Download App
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold">F</span>
                </div>
                <span className="text-xl font-bold">FitGlide</span>
              </div>
              <p className="text-gray-400 text-sm">
                The marketing platform built specifically for fitness professionals.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/campaigns" className="hover:text-white transition-colors">Campaigns</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FitGlide. All rights reserved. Built for fitness professionals who want to dominate their market. 💪</p>
          </div>
        </div>
      </footer>
    </div>
  )
}