import { buildApiUrl } from "../lib/api";

export async function getForumThreads() {
  const response = await fetch(buildApiUrl("/forum/threads"), {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.error || "Failed to load study discussions");
  }

  return data.data.threads;
}

export async function getForumThread(threadId) {
  const response = await fetch(buildApiUrl(`/forum/threads/${threadId}`), {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.error || "Failed to load discussion thread");
  }

  return data.data.thread;
}

export async function createForumThread(payload) {
  const response = await fetch(buildApiUrl("/forum/threads"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.error || "Failed to create thread");
  }

  return data.data;
}

export async function createForumReply(threadId, payload) {
  const response = await fetch(buildApiUrl(`/forum/threads/${threadId}/posts`), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.error || "Failed to post reply");
  }

  return data.data;
}
