import { buildApiUrl } from "../lib/api";

async function readJsonResponse(response, fallbackMessage) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status === "error" || result.status === "fail") {
    throw new Error(result.error || result.message || fallbackMessage);
  }
  return result;
}

export async function uploadBook(formData) {
  const response = await fetch(buildApiUrl("/resources/uploadBook"), {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const result = await readJsonResponse(response, "Failed to upload book");
  return { status: "ok", data: result.data.resource };
}

export async function uploadVideo(formData) {
  const response = await fetch(buildApiUrl("/resources/uploadVideo"), {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const result = await readJsonResponse(response, "Failed to upload video");
  return { status: "ok", data: result.data.resource };
}

export async function registerPhysicalResource(payload) {
  const response = await fetch(buildApiUrl("/resources/registerPhysical"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const result = await readJsonResponse(
    response,
    "Failed to register physical resource",
  );
  return result.data;
}

export async function getAllBooks() {
  const response = await fetch(buildApiUrl("/resources/reading"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const result = await readJsonResponse(response, "Failed to fetch books");
  return result.data.resources;
}

export async function getTextbooks() {
  const response = await fetch(buildApiUrl("/resources/reading/textbooks"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const result = await readJsonResponse(response, "Failed to fetch textbooks");
  return result.data.resources;
}

export async function getTeacherMaterials() {
  const response = await fetch(buildApiUrl("/resources/reading/materials"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const result = await readJsonResponse(
    response,
    "Failed to fetch teacher materials",
  );
  return result.data.resources;
}

export async function getAllVideos() {
  const response = await fetch(buildApiUrl("/resources/videos"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const result = await readJsonResponse(response, "Failed to fetch videos");
  return result.data.resources;
}

export async function searchResources(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const response = await fetch(
    buildApiUrl(
      `/resources/search${query.toString() ? `?${query.toString()}` : ""}`,
    ),
    {
      method: "GET",
      credentials: "include",
    },
  );
  const result = await readJsonResponse(response, "Failed to search resources");
  return result.data.resources;
}

export async function getResourceById(resourceId) {
  const response = await fetch(buildApiUrl(`/resources/${resourceId}`), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(response, "Failed to fetch resource");
  return result.data.resource;
}

export async function getManagedResources() {
  const response = await fetch(buildApiUrl("/resources/manage"), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(
    response,
    "Failed to load managed resources",
  );
  return result.data.resources;
}

export async function updateManagedResource(resourceId, payload) {
  const response = await fetch(buildApiUrl(`/resources/manage/${resourceId}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return readJsonResponse(response, "Failed to update resource");
}

export async function deleteManagedResource(resourceId) {
  const response = await fetch(buildApiUrl(`/resources/manage/${resourceId}`), {
    method: "DELETE",
    credentials: "include",
  });
  return readJsonResponse(response, "Failed to delete resource");
}

export async function borrowPhysicalResource(resourceId) {
  const response = await fetch(buildApiUrl(`/borrows/physical/${resourceId}`), {
    method: "POST",
    credentials: "include",
  });
  return readJsonResponse(response, "Failed to borrow physical resource");
}

export async function returnBorrow(transactionId) {
  const response = await fetch(
    buildApiUrl(`/borrows/${transactionId}/return`),
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  return readJsonResponse(response, "Failed to return resource");
}

export async function getMyBorrows() {
  const response = await fetch(buildApiUrl("/borrows"), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(response, "Failed to fetch borrows");
  return result.data.transactions;
}

export async function getOverdueBorrows() {
  const response = await fetch(buildApiUrl("/borrows/overdue/list"), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(
    response,
    "Failed to fetch overdue borrows",
  );
  return result.data.transactions;
}

export async function getLearningDashboard() {
  const response = await fetch(buildApiUrl("/learning/dashboard"), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(
    response,
    "Failed to fetch learning dashboard",
  );
  return result.data;
}

export async function getBookmarks() {
  const response = await fetch(buildApiUrl("/learning/bookmarks"), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(response, "Failed to fetch bookmarks");
  return result.data.bookmarks;
}

export async function addBookmark(resourceId) {
  const response = await fetch(
    buildApiUrl(`/learning/bookmarks/${resourceId}`),
    {
      method: "POST",
      credentials: "include",
    },
  );
  return readJsonResponse(response, "Failed to bookmark resource");
}

export async function removeBookmark(resourceId) {
  const response = await fetch(
    buildApiUrl(`/learning/bookmarks/${resourceId}`),
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  return readJsonResponse(response, "Failed to remove bookmark");
}

export async function updateReadingProgress(resourceId, payload) {
  const response = await fetch(
    buildApiUrl(`/learning/progress/${resourceId}`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    },
  );
  return readJsonResponse(response, "Failed to update reading progress");
}

export async function getReadingLists() {
  const response = await fetch(buildApiUrl("/learning/reading-lists"), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(
    response,
    "Failed to fetch reading lists",
  );
  return result.data.readingLists;
}

export async function createReadingList(payload) {
  const response = await fetch(buildApiUrl("/learning/reading-lists"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return readJsonResponse(response, "Failed to create reading list");
}

export async function addReadingListItem(readingListId, payload) {
  const response = await fetch(
    buildApiUrl(`/learning/reading-lists/${readingListId}/items`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    },
  );
  return readJsonResponse(response, "Failed to add reading list item");
}

// ===== RESERVATION FUNCTIONS =====

export async function createReservation(resourceId) {
  const response = await fetch(buildApiUrl(`/borrows/reserve/${resourceId}`), {
    method: "POST",
    credentials: "include",
  });
  return readJsonResponse(response, "Failed to create reservation");
}

export async function getMyReservations() {
  const response = await fetch(buildApiUrl("/borrows/reservations"), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(
    response,
    "Failed to fetch reservations",
  );
  return result.data.reservations;
}

export async function cancelReservation(reservationId) {
  const response = await fetch(
    buildApiUrl(`/borrows/reservations/${reservationId}`),
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  return readJsonResponse(response, "Failed to cancel reservation");
}
