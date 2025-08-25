import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMM dd, yyyy')
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function calculateViralCoefficient(views: number, shares: number): number {
  if (views === 0) return 0
  return Math.round((shares / views) * 100 * 10) / 10
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function generateMockContent(type: 'blog' | 'social' | 'topic'): any {
  const mockData = {
    blog: {
      title: "10-Minute HIIT Workout for Busy Professionals",
      content: `Looking for a quick, effective workout that fits into your busy schedule? This 10-minute HIIT workout is perfect for professionals who want to stay fit without spending hours at the gym.

## Why HIIT Works for Busy Professionals

High-Intensity Interval Training (HIIT) is scientifically proven to:
- Burn more calories in less time
- Boost metabolism for hours after exercise
- Improve cardiovascular health
- Build lean muscle mass

## The 10-Minute Workout

**Warm-up (1 minute):**
- Jumping jacks: 30 seconds
- Arm circles: 30 seconds

**Main Circuit (8 minutes):**
Complete 4 rounds of:
1. **Burpees** - 30 seconds
2. **Mountain climbers** - 30 seconds
3. **High knees** - 30 seconds
4. **Push-ups** - 30 seconds
5. **Rest** - 30 seconds

**Cool-down (1 minute):**
- Stretching exercises

## Tips for Success

1. **Start slow** - Don't push yourself too hard initially
2. **Stay consistent** - Do this workout 3-4 times per week
3. **Listen to your body** - Modify exercises as needed
4. **Track progress** - Use a fitness app to monitor improvements

This workout is perfect for early mornings, lunch breaks, or after work. No equipment needed - just you and your determination!`,
      excerpt: "A quick, effective HIIT workout designed specifically for busy professionals who want to stay fit without spending hours at the gym.",
      seoTitle: "10-Minute HIIT Workout for Busy Professionals | FitGlide",
      seoDescription: "Get fit in just 10 minutes with this effective HIIT workout designed for busy professionals. No equipment needed, maximum results guaranteed.",
      metaKeywords: "HIIT workout, busy professionals, quick workout, 10 minute workout, fitness, exercise"
    },
    social: {
      content: "🔥 10-Minute HIIT Workout for Busy Professionals! 💪\n\nNo time for the gym? No problem! This quick workout will torch calories and boost your energy in just 10 minutes.\n\n✅ No equipment needed\n✅ Perfect for busy schedules\n✅ Scientifically proven results\n\nTry it now and feel the difference! #HIIT #Fitness #BusyProfessionals #Workout #FitGlide",
      platform: "twitter"
    },
    topic: {
      title: "Quick Workouts for Busy Professionals",
      description: "Research and create content around time-efficient workout routines that fit into busy professional schedules.",
      category: "Fitness",
      keywords: "quick workouts, busy professionals, time-efficient exercise, HIIT, morning workouts, lunch break fitness"
    }
  }

  return mockData[type]
}

export function generateMockAnalytics(): any {
  return {
    totalUsers: 1247,
    viralCoefficient: 7.2,
    totalViews: 45300,
    totalShares: 3200,
    topContent: [
      {
        title: "10-Minute HIIT Workout for Busy Professionals",
        views: 15400,
        shares: 1200,
        likes: 892,
        viralScore: 8.1
      },
      {
        title: "5 Protein-Rich Breakfast Ideas for Muscle Building",
        views: 12300,
        shares: 980,
        likes: 756,
        viralScore: 7.8
      },
      {
        title: "Morning Routine: 15 Minutes to Transform Your Day",
        views: 9800,
        shares: 850,
        likes: 623,
        viralScore: 7.2
      }
    ],
    recentActivity: [
      {
        type: "blog_published",
        title: "10-Minute HIIT Workout for Busy Professionals",
        time: "2 hours ago"
      },
      {
        type: "social_posted",
        platform: "Twitter",
        time: "4 hours ago"
      },
      {
        type: "campaign_launched",
        name: "Summer Fitness Challenge",
        time: "1 day ago"
      }
    ]
  }
}
