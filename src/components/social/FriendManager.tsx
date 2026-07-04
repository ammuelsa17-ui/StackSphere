"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, UserMinus, Search, Check, X, Star, Users, UserRoundPlus } from "lucide-react";

interface UserType {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  subscription?: {
    plan: string;
  };
  relationship: "none" | "sent" | "received" | "friends";
  requestId?: string;
}

interface RequestType {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    subscription?: {
      plan: string;
    };
  };
  createdAt: string;
}

interface FriendType {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  subscription?: {
    plan: string;
  };
}

export default function FriendManager() {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "search">("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RequestType[]>([]);
  const [friendsList, setFriendsList] = useState<FriendType[]>([]);
  
  // Loading states
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    setIsLoadingFriends(true);
    try {
      const response = await fetch("/api/friends?type=list");
      if (!response.ok) throw new Error("Failed to load friends list.");
      const data = await response.json();
      if (data.success) {
        setFriendsList(data.friends || []);
      }
    } catch (err) {
      console.error("Load friends error:", err);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const loadRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await fetch("/api/friends?type=requests");
      if (!response.ok) throw new Error("Failed to load requests.");
      const data = await response.json();
      if (data.success) {
        setPendingRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Load requests error:", err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoadingSearch(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!response.ok) throw new Error("Search query failed.");
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    setActioningId(receiverId);
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send request.");
      }

      const data = await response.json();
      if (data.success) {
        // Update local search results state
        setSearchResults((prev) =>
          prev.map((user) =>
            user.id === receiverId
              ? { ...user, relationship: "sent", requestId: data.request.id }
              : user
          )
        );
      }
    } catch (err: any) {
      alert(err.message || "Could not send friend request.");
    } finally {
      setActioningId(null);
    }
  };

  const handleRequestResponse = async (requestId: string, action: "accept" | "reject") => {
    setActioningId(requestId);
    try {
      const response = await fetch("/api/friends/request/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to respond to request.");
      }

      const data = await response.json();
      if (data.success) {
        // Remove from pending requests list
        setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
        
        // If accepted, reload friends list
        if (action === "accept") {
          loadFriends();
        }

        // Update search results list if request exists in it
        setSearchResults((prev) =>
          prev.map((user) =>
            user.requestId === requestId
              ? { ...user, relationship: action === "accept" ? "friends" : "none", requestId: "" }
              : user
          )
        );
      }
    } catch (err: any) {
      alert(err.message || "Failed to respond to friend request.");
    } finally {
      setActioningId(null);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    setActioningId(friendId);
    try {
      const response = await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove friend.");
      }

      const data = await response.json();
      if (data.success) {
        setFriendsList((prev) => prev.filter((f) => f.id !== friendId));
        // Reset search states
        setSearchResults((prev) =>
          prev.map((user) =>
            user.id === friendId ? { ...user, relationship: "none" } : user
          )
        );
      }
    } catch (err: any) {
      alert(err.message || "Could not remove friend.");
    } finally {
      setActioningId(null);
    }
  };

  // Avatar generation helpers
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const charSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-indigo-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-violet-500 to-fuchsia-600",
      "from-teal-500 to-emerald-600",
      "from-rose-500 to-pink-600",
    ];
    return colors[charSum % colors.length];
  };

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "gold":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30";
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/30";
      case "bronze":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/30 dark:text-neutral-400 dark:border-neutral-800/30";
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Widget Tabs */}
      <div className="flex border-b border-neutral-250 dark:border-neutral-700/60 bg-neutral-50/50 dark:bg-neutral-900/10">
        <button
          onClick={() => setActiveTab("friends")}
          className={`flex-1 py-3 px-1 sm:px-2 text-center text-[10px] sm:text-xs font-bold transition-all relative ${
            activeTab === "friends"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-neutral-500 hover:text-neutral-750 dark:hover:text-neutral-300"
          }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Friends ({friendsList.length})</span>
          </div>
          {activeTab === "friends" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 py-3 px-1 sm:px-2 text-center text-[10px] sm:text-xs font-bold transition-all relative ${
            activeTab === "requests"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-neutral-500 hover:text-neutral-750 dark:hover:text-neutral-300"
          }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <UserRoundPlus className="h-3.5 w-3.5" />
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="inline-flex items-center justify-center px-1 py-px text-[8px] sm:text-[9px] font-bold bg-indigo-600 text-white rounded-full leading-none">
                {pendingRequests.length}
              </span>
            )}
          </div>
          {activeTab === "requests" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-3 px-1 sm:px-2 text-center text-[10px] sm:text-xs font-bold transition-all relative ${
            activeTab === "search"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-neutral-500 hover:text-neutral-750 dark:hover:text-neutral-300"
          }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <Search className="h-3.5 w-3.5" />
            <span>Find</span>
          </div>
          {activeTab === "search" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 flex-1 min-h-[300px] max-h-[420px] overflow-y-auto space-y-4">
        
        {/* TAB 1: FRIENDS LIST */}
        {activeTab === "friends" && (
          <div className="space-y-3.5">
            {isLoadingFriends ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-[10px] text-neutral-450 font-semibold">Loading friends...</span>
              </div>
            ) : friendsList.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-xs text-neutral-450 dark:text-neutral-500 font-medium">
                  No friends added yet.
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 underline"
                >
                  Find and add members
                </button>
              </div>
            ) : (
              friendsList.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarColor(friend.name)} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}>
                        {getInitials(friend.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate">
                          {friend.name}
                        </h4>
                        {friend.subscription?.plan && (
                          <span className={`inline-flex items-center gap-0.5 px-1 py-px text-[7px] font-bold border rounded-full ${getPlanColor(friend.subscription.plan)}`}>
                            <Star className="h-1.5 w-1.5 fill-current" />
                            {friend.subscription.plan}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                        {friend.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFriend(friend.id)}
                    disabled={actioningId === friend.id}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:border-rose-200 dark:border-neutral-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-neutral-500 hover:text-rose-600 transition-all shrink-0"
                    title="Remove Friend"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PENDING REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-3.5">
            {isLoadingRequests ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-[10px] text-neutral-450 font-semibold">Loading requests...</span>
              </div>
            ) : pendingRequests.length === 0 ? (
              <p className="text-xs text-neutral-450 dark:text-neutral-500 text-center py-10 font-medium">
                No pending requests.
              </p>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {req.sender.avatarUrl ? (
                      <img
                        src={req.sender.avatarUrl}
                        alt={req.sender.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarColor(req.sender.name)} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}>
                        {getInitials(req.sender.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate">
                          {req.sender.name}
                        </h4>
                        {req.sender.subscription?.plan && (
                          <span className={`inline-flex items-center gap-0.5 px-1 py-px text-[7px] font-bold border rounded-full ${getPlanColor(req.sender.subscription.plan)}`}>
                            <Star className="h-1.5 w-1.5 fill-current" />
                            {req.sender.subscription.plan}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                        Sent {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleRequestResponse(req.id, "accept")}
                      disabled={actioningId === req.id}
                      className="p-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-550 text-white shadow-sm transition-all"
                      title="Accept Request"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRequestResponse(req.id, "reject")}
                      disabled={actioningId === req.id}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-700 transition-all"
                      title="Ignore Request"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: SEARCH MEMBERS */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or email..."
                className="flex-1 h-8.5 px-3 rounded-lg border border-neutral-250 dark:border-neutral-700 bg-transparent text-xs text-neutral-905 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={isLoadingSearch || !searchQuery.trim()}
                className="h-8.5 px-3 rounded-lg bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50"
              >
                Search
              </button>
            </form>

            <div className="space-y-3.5 pt-1">
              {isLoadingSearch ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-[10px] text-neutral-450 font-semibold">Searching users...</span>
                </div>
              ) : searchResults.length === 0 ? (
                searchQuery.trim() && (
                  <p className="text-xs text-neutral-450 dark:text-neutral-500 text-center py-4 font-medium">
                    No users found matching your search.
                  </p>
                )
              ) : (
                searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}>
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate">
                            {user.name}
                          </h4>
                          {user.subscription?.plan && (
                            <span className={`inline-flex items-center gap-0.5 px-1 py-px text-[7px] font-bold border rounded-full ${getPlanColor(user.subscription.plan)}`}>
                              <Star className="h-1.5 w-1.5 fill-current" />
                              {user.subscription.plan}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {user.relationship === "friends" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-lg">
                          <UserCheck className="h-3 w-3" />
                          <span>Friends</span>
                        </span>
                      ) : user.relationship === "sent" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold bg-neutral-50 dark:bg-neutral-905 border border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-lg">
                          <span>Pending</span>
                        </span>
                      ) : user.relationship === "received" ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRequestResponse(user.requestId!, "accept")}
                            disabled={actioningId === user.requestId}
                            className="p-1 rounded-md bg-indigo-650 hover:bg-indigo-550 text-white shadow-sm transition-all"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleRequestResponse(user.requestId!, "reject")}
                            disabled={actioningId === user.requestId}
                            className="p-1 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 text-neutral-500 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(user.id)}
                          disabled={actioningId === user.id}
                          className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg transition-all shadow-sm disabled:opacity-50"
                        >
                          <UserPlus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
