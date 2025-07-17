"use client"

import { useState, useEffect } from 'react'

/**
 * Hook to prevent hydration errors with time formatting
 * Returns null on server, actual time on client
 */
export function useClientTime(date: Date | string | number): string | null {
  const [timeString, setTimeString] = useState<string | null>(null)

  useEffect(() => {
    setTimeString(new Date(date).toLocaleTimeString())
  }, [date])

  return timeString
}

/**
 * Hook to prevent hydration errors with date formatting
 */
export function useClientDate(date: Date | string | number): string | null {
  const [dateString, setDateString] = useState<string | null>(null)

  useEffect(() => {
    setDateString(new Date(date).toLocaleDateString())
  }, [date])

  return dateString
}

/**
 * Hook to prevent hydration errors with datetime formatting
 */
export function useClientDateTime(date: Date | string | number): string | null {
  const [dateTimeString, setDateTimeString] = useState<string | null>(null)

  useEffect(() => {
    setDateTimeString(new Date(date).toLocaleString())
  }, [date])

  return dateTimeString
}