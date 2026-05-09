'use client'

import { useState, useEffect, useRef, useActionState } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import {
  checkInAction,
  updateStreakNameAction,
  deleteStreakAction,
} from '@/app/actions/streaks'
import type { Tables } from '@/types/database.types'

dayjs.extend(relativeTime)

type Streak = Tables<'streaks'>

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface Props {
  streak: Streak
  checkedDates: string[]
  todayChecked: boolean
}

export function StreakDetail({ streak, checkedDates, todayChecked }: Props) {
  // ── Check-in ────────────────────────────────────────────────────────────────
  const boundCheckIn = checkInAction.bind(null, streak.id)
  const [checkInError, checkInFormAction, checkInPending] = useActionState(boundCheckIn, null)
  const wasCheckingIn = useRef(false)
  const checkInButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (wasCheckingIn.current && !checkInPending) {
      if (checkInError) {
        toast.error(checkInError)
      } else {
        toast.success('🔥 Checked in! Keep the streak going!')
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
      }
    }
    wasCheckingIn.current = checkInPending
  }, [checkInPending, checkInError])

  // Spacebar shortcut: press space anywhere (not in an input) to check in
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (todayChecked || checkInPending) return
      if (e.key !== ' ') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
      e.preventDefault()
      checkInButtonRef.current?.click()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [todayChecked, checkInPending])

  // ── Edit name ────────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [nameInput, setNameInput] = useState(streak.name)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const boundUpdateName = updateStreakNameAction.bind(null, streak.id)
  const [nameError, nameFormAction, namePending] = useActionState(boundUpdateName, null)
  const wasUpdatingName = useRef(false)

  useEffect(() => {
    if (wasUpdatingName.current && !namePending) {
      if (nameError === null) {
        setIsEditing(false)
        toast.success('Name updated!')
      }
    }
    wasUpdatingName.current = namePending
  }, [namePending, nameError])

  useEffect(() => {
    if (!isEditing) setNameInput(streak.name)
  }, [streak.name, isEditing])

  const handleEditOpen = () => {
    setIsEditing(true)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setNameInput(streak.name)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(false)
  const boundDelete = deleteStreakAction.bind(null, streak.id)
  const [deleteError, deleteFormAction, deletePending] = useActionState(boundDelete, null)
  const prevDeleteError = useRef<string | null>(null)

  useEffect(() => {
    if (deleteError && deleteError !== prevDeleteError.current) {
      toast.error(deleteError)
    }
    prevDeleteError.current = deleteError
  }, [deleteError])

  // ── Calendar ────────────────────────────────────────────────────────────────
  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')
  const checkedSet = new Set(checkedDates)
  const days = Array.from({ length: 30 }, (_, i) => today.subtract(29 - i, 'day'))
  const firstDayOfWeek = days[0].day()

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to dashboard
      </Link>

      {/* Name card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isEditing ? (
          <form action={nameFormAction} className="space-y-3">
            <div>
              <label htmlFor="streak-name-edit" className="block text-sm font-medium text-gray-700 mb-1">
                Streak name
              </label>
              <input
                id="streak-name-edit"
                ref={nameInputRef}
                name="name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={50}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${nameInput.length >= 45 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {nameInput.length}/50
                </span>
              </div>
            </div>
            {nameError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{nameError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEditCancel}
                disabled={namePending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={namePending || nameInput.trim().length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {namePending && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {namePending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 flex-1">{streak.name}</h1>
            <button
              onClick={handleEditOpen}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Edit streak name"
              title="Edit name"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.93l-3.414.656.656-3.414a4 4 0 01.93-1.414z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Stats + check-in card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Current streak
            </p>
            <p className="text-8xl font-black text-blue-600 leading-none tabular-nums">
              {streak.count}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {streak.count === 1 ? 'day' : 'days'}
            </p>
          </div>

          <div className="sm:mb-3">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Last checked
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {streak.last_checked_date
                ? dayjs(streak.last_checked_date).fromNow()
                : 'Never'}
            </p>
          </div>
        </div>

        <form action={checkInFormAction}>
          {todayChecked ? (
            <div className="flex items-center gap-3 px-6 py-4 bg-green-50 border border-green-200 rounded-xl">
              <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold text-green-800">Checked in today!</p>
                <p className="text-sm text-green-600">Come back tomorrow to keep your streak going.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                ref={checkInButtonRef}
                type="submit"
                disabled={checkInPending}
                className="w-full py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {checkInPending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Checking in…
                  </span>
                ) : (
                  'Check In Today'
                )}
              </button>
              <p className="text-center text-xs text-gray-400">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-500 font-mono">Space</kbd> to check in
              </p>
            </div>
          )}
        </form>
      </div>

      {/* 30-day calendar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Last 30 days
        </h2>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = day.format('YYYY-MM-DD')
            const isChecked = checkedSet.has(dateStr)
            const isToday = dateStr === todayStr
            return (
              <div
                key={dateStr}
                title={day.format('MMM D, YYYY')}
                className={[
                  'aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors',
                  isChecked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400',
                  isToday ? 'ring-2 ring-blue-500 ring-offset-1' : '',
                ].join(' ')}
              >
                {day.format('D')}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
            Checked in
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gray-100 inline-block" />
            Missed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gray-100 ring-2 ring-blue-500 ring-offset-0.5 inline-block" />
            Today
          </span>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3">
          Danger zone
        </h2>
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-700 flex-1">
              Delete <span className="font-semibold">{streak.name}</span>? This cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={deletePending}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <form action={deleteFormAction}>
              <button
                type="submit"
                disabled={deletePending}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deletePending && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {deletePending ? 'Deleting…' : 'Yes, delete'}
              </button>
            </form>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete this streak
          </button>
        )}
      </div>
    </div>
  )
}
