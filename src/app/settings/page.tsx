'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Settings() {
  // Simplified settings for personal FitGlide tool
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      weeklyReports: true,
      viralAlerts: true
    },
    ai: {
      autoGenerate: false,
      costFreeMode: true,
      gptPlusWorkflow: false
    },
    content: {
      autoPublish: false,
      multiPlatform: true
    }
  })

  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const handleSaveSettings = async () => {
    try {
      // For now, just simulate save since it's a personal tool
      setStatusMessage({ type: 'success', message: 'FitGlide settings saved successfully!' })
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error) {
      setStatusMessage({ type: 'error', message: 'Failed to save settings' })
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FitGlide Settings</h1>
              <p className="mt-2 text-gray-600">Customize your personal FitGlide Marketing Hub</p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-4 rounded-md mb-6 ${
            statusMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {statusMessage.message}
          </div>
        )}

        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">Manage how you receive updates about your fitness content performance</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive email updates about content performance</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: !prev.notifications.email }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Weekly Reports</label>
                  <p className="text-sm text-gray-500">Get weekly summaries of your content performance</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, weeklyReports: !prev.notifications.weeklyReports }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.weeklyReports ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Viral Alerts</label>
                  <p className="text-sm text-gray-500">Get notified when your content starts going viral</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, viralAlerts: !prev.notifications.viralAlerts }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.viralAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.viralAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* AI & Automation */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">AI & Automation</h3>
              <p className="text-sm text-gray-500">Configure AI-powered content generation for fitness topics</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Cost-Free Mode</label>
                  <p className="text-sm text-gray-500">Only use free APIs and tools for content research</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    ai: { ...prev.ai, costFreeMode: !prev.ai.costFreeMode }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.ai.costFreeMode ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.ai.costFreeMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Auto-Generate Content</label>
                  <p className="text-sm text-gray-500">Automatically create fitness content based on trending keywords</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    ai: { ...prev.ai, autoGenerate: !prev.ai.autoGenerate }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.ai.autoGenerate ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.ai.autoGenerate ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Content Settings</h3>
              <p className="text-sm text-gray-500">Manage your fitness content publishing preferences</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Multi-Platform Publishing</label>
                  <p className="text-sm text-gray-500">Publish content across multiple social media platforms</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    content: { ...prev.content, multiPlatform: !prev.content.multiPlatform }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.content.multiPlatform ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.content.multiPlatform ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Auto-Publish</label>
                  <p className="text-sm text-gray-500">Automatically publish approved content at optimal times</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    content: { ...prev.content, autoPublish: !prev.content.autoPublish }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.content.autoPublish ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.content.autoPublish ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* FitGlide Info */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-900">FitGlide Marketing Hub</h4>
              <p className="text-gray-600">Your personal SEO & SMO powerhouse for fitness content domination! 💪</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}