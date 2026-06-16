"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

interface Friend {
  id: string;
  username: string | null;
}

interface ReceivedRequest {
  id: string;
  requesterId: string;
  requesterName: string;
}

interface SentRequest {
  id: string;
  targetId: string;
  targetName: string;
}

interface FeedItem {
  friend_id: string;
  friend_name: string;
  streak_id: string;
  streak_name: string;
  checked_at: string;
  date: string;
  note: string | null;
}

interface LazyFriend {
  friend_id: string;
  friend_name: string;
  streak_id: string;
  streak_name: string;
  last_checked_date: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  streak_id: string;
  streak_name: string;
  streak_count: number;
}

interface FriendsPageProps {
  currentUserId: string;
  friends: Friend[];
  receivedRequests: ReceivedRequest[];
  sentRequests: SentRequest[];
  feed: FeedItem[];
  lazyFriends: LazyFriend[];
  leaderboard: LeaderboardEntry[];
}

function FeedSection({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-12">No recent activity from friends</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={`${item.streak_id}-${item.checked_at}-${i}`} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <Link href={`/u/${item.friend_id}`} className="font-medium text-blue-600 hover:text-blue-800">
                {item.friend_name}
              </Link>
              <span className="text-gray-700"> checked in to </span>
              <span className="font-medium text-gray-900">{item.streak_name}</span>
              {item.note && (
                <p className="text-sm text-gray-500 mt-1 italic">"{item.note}"</p>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0 ml-4">
              {dayjs(item.checked_at).fromNow()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LazyFriendsSection({ items }: { items: LazyFriend[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-amber-400 rounded-full" />
        Needs encouragement
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={`${item.friend_id}-${item.streak_id}`} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/u/${item.friend_id}`} className="font-medium text-amber-900 hover:text-amber-700">
                  {item.friend_name}
                </Link>
                <span className="text-amber-800"> hasn't checked </span>
                <span className="font-medium text-amber-900">{item.streak_name}</span>
                {item.last_checked_date && (
                  <span className="text-amber-700"> since {dayjs(item.last_checked_date).fromNow()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-500 font-black',
  2: 'text-gray-400 font-black',
  3: 'text-amber-600 font-black',
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-orange-500']

function avatarColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function LeaderboardSection({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId: string }) {
  if (entries.length === 0) {
    return <p className="text-center text-gray-500 py-12">No streaks on the leaderboard yet</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.streak_id}
          className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
            entry.user_id === currentUserId ? 'border-blue-300 ring-1 ring-blue-200' : 'border-gray-200'
          }`}
        >
          <div className={`w-8 text-center text-lg font-bold ${RANK_STYLES[entry.rank] ?? 'text-gray-700'}`}>
            #{entry.rank}
          </div>
          <div className={`w-9 h-9 rounded-full ${avatarColor(entry.user_id)} text-white text-sm font-semibold flex items-center justify-center shrink-0`}>
            {entry.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/u/${entry.user_id}`} className="font-medium text-gray-900 hover:text-blue-600">
              {entry.username}
              {entry.user_id === currentUserId && <span className="ml-1 text-xs text-gray-400">(you)</span>}
            </Link>
            <p className="text-sm text-gray-500 truncate">{entry.streak_name}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-blue-600">{entry.streak_count}</p>
            <p className="text-xs text-gray-400">days</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FriendsPage({
  currentUserId,
  friends: initialFriends,
  receivedRequests: initialReceived,
  sentRequests: initialSent,
  feed: initialFeed,
  lazyFriends: initialLazy,
  leaderboard: initialLeaderboard,
}: FriendsPageProps) {
  const [tab, setTab] = useState<"feed" | "friends" | "requests" | "search" | "leaderboard">("feed");
  const [friends, setFriends] = useState(initialFriends);
  const [receivedRequests, setReceivedRequests] = useState(initialReceived);
  const [sentRequests, setSentRequests] = useState(initialSent);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; username: string | null }[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const api = useCallback(async (action: string, targetUserId: string) => {
    setActionLoading(targetUserId);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        body: JSON.stringify({ targetUserId, action }),
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      return data;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Request failed');
      return { error: 'Request failed' };
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setSearchResults(data.users ?? []);
    setSearching(false);
  }, []);

  const handleAccept = useCallback(async (requesterId: string) => {
    const { error } = await api("accept-request", requesterId);
    if (!error) {
      setReceivedRequests((prev) => prev.filter((r) => r.requesterId !== requesterId));
      const user = initialReceived.find((r) => r.requesterId === requesterId);
      if (user) setFriends((prev) => [...prev, { id: user.requesterId, username: user.requesterName }]);
    }
  }, [api, initialReceived]);

  const handleReject = useCallback(async (requesterId: string) => {
    const { error } = await api("reject-request", requesterId);
    if (!error) setReceivedRequests((prev) => prev.filter((r) => r.requesterId !== requesterId));
  }, [api]);

  const handleRemoveFriend = useCallback(async (friendId: string) => {
    const { error } = await api("remove-friend", friendId);
    if (!error) setFriends((prev) => prev.filter((f) => f.id !== friendId));
  }, [api]);

  const handleCancelRequest = useCallback(async (targetId: string) => {
    const { error } = await api("unfollow", targetId);
    if (!error) setSentRequests((prev) => prev.filter((r) => r.targetId !== targetId));
  }, [api]);

  const handleSendRequest = useCallback(async (targetUserId: string) => {
    const { error } = await api("friend-request", targetUserId);
    if (!error) setSearchResults((prev) => prev.filter((r) => r.id !== targetUserId));
  }, [api]);

  const tabs = [
    { key: "feed" as const, label: "Feed" },
    { key: "friends" as const, label: `Friends (${friends.length})` },
    { key: "requests" as const, label: `Requests (${receivedRequests.length})` },
    { key: "search" as const, label: "Search" },
    { key: "leaderboard" as const, label: "Leaderboard" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Friends</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto bg-gray-100 rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "feed" && (
          <div>
            <FeedSection items={initialFeed} />
            <LazyFriendsSection items={initialLazy} />
          </div>
        )}

        {tab === "friends" && (
          <div className="space-y-2">
            {friends.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No friends yet</p>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <Link href={`/u/${friend.username ?? friend.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {friend.username ?? "Anonymous"}
                  </Link>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    disabled={actionLoading === friend.id}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "requests" && (
          <div className="space-y-6">
            {receivedRequests.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Received</h2>
                <div className="space-y-2">
                  {receivedRequests.map((req) => (
                    <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                      <Link href={`/u/${req.requesterId}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {req.requesterName}
                      </Link>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req.requesterId)}
                          disabled={actionLoading === req.requesterId}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(req.requesterId)}
                          disabled={actionLoading === req.requesterId}
                          className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sentRequests.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Sent</h2>
                <div className="space-y-2">
                  {sentRequests.map((req) => (
                    <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                      <Link href={`/u/${req.targetId}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {req.targetName}
                      </Link>
                      <div className="flex gap-2">
                        <span className="text-sm text-amber-600 font-medium">Pending</span>
                        <button
                          onClick={() => handleCancelRequest(req.targetId)}
                          disabled={actionLoading === req.targetId}
                          className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {receivedRequests.length === 0 && sentRequests.length === 0 && (
              <p className="text-center text-gray-500 py-12">No pending requests</p>
            )}
          </div>
        )}

        {tab === "search" && (
          <div>
            <input
              type="text"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searching && <p className="text-sm text-gray-400 mt-2">Searching...</p>}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((u) => (
                  <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <Link href={`/u/${u.username ?? u.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {u.username}
                    </Link>
                    <button
                      onClick={() => handleSendRequest(u.id)}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <LeaderboardSection entries={initialLeaderboard} currentUserId={currentUserId} />
        )}
      </div>
    </main>
  );
}
