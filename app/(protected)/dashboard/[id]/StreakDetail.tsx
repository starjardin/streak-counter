"use client";

import {
  useState,
  useEffect,
  useRef,
  useActionState,
  startTransition,
} from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  checkInAction,
  updateStreakNameAction,
  deleteStreakAction,
} from "@/app/actions/streaks";
import { Calendar } from "./Calendar";
import { DangerZone } from "./DangerZone";
import { Form } from "./Form";
import { CardName } from "./CardName";
import { Streak } from "./type";
import { StatusCheckIn } from "./StatusCheckIn";

interface Props {
  streak: Streak;
  checkedDates: string[];
  todayChecked: boolean;
}

export function StreakDetail({ streak, checkedDates, todayChecked }: Props) {
  const boundCheckIn = checkInAction.bind(null, streak.id);
  const [checkInError, checkInFormAction, checkInPending] = useActionState(
    boundCheckIn,
    null,
  );
  const wasCheckingIn = useRef(false);
  const checkInButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (wasCheckingIn.current && !checkInPending) {
      if (checkInError) {
        toast.error(checkInError);
      } else {
        toast.success("🔥 Checked in! Keep the streak going!");
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    }
    wasCheckingIn.current = checkInPending;
  }, [checkInPending, checkInError]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (todayChecked || checkInPending) return;
      if (e.key !== " ") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      e.preventDefault();
      checkInButtonRef.current?.click();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [todayChecked, checkInPending]);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(streak.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const boundUpdateName = updateStreakNameAction.bind(null, streak.id);
  const [nameError, nameFormAction, namePending] = useActionState(
    boundUpdateName,
    null,
  );
  const wasUpdatingName = useRef(false);

  useEffect(() => {
    if (wasUpdatingName.current && !namePending) {
      if (nameError === null) {
        startTransition(() => setIsEditing(false));
        toast.success("Name updated!");
      }
    }
    wasUpdatingName.current = namePending;
  }, [namePending, nameError]);

  const handleEditOpen = () => {
    setIsEditing(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setNameInput(streak.name);
  };

  const [confirmDelete, setConfirmDelete] = useState(false);
  const boundDelete = deleteStreakAction.bind(null, streak.id);
  const [deleteError, deleteFormAction, deletePending] = useActionState(
    boundDelete,
    null,
  );
  const prevDeleteError = useRef<string | null>(null);

  useEffect(() => {
    if (deleteError && deleteError !== prevDeleteError.current) {
      toast.error(deleteError);
    }
    prevDeleteError.current = deleteError;
  }, [deleteError]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to dashboard
      </Link>
      {/* Name card */}
      <CardName
        streakName={streak.name}
        isEditing={isEditing}
        nameInput={nameInput}
        setNameInput={setNameInput}
        nameError={nameError}
        namePending={namePending}
        handleEditOpen={handleEditOpen}
        handleEditCancel={handleEditCancel}
        nameFormAction={nameFormAction}
        nameInputRef={nameInputRef}
      />
      {/* Stats + check-in card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StatusCheckIn streak={streak} />
        <Form
          checkInFormAction={checkInFormAction}
          todayChecked={todayChecked}
          checkInPending={checkInPending}
          checkInButtonRef={checkInButtonRef}
        />
      </div>
      <Calendar checkedDates={checkedDates} />
      <DangerZone
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        deletePending={deletePending}
        streak={streak}
        deleteFormAction={deleteFormAction}
      />
    </div>
  );
}
