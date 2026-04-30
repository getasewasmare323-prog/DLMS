import { buildApiUrl } from "../lib/api";

async function readJsonResponse(response, fallbackMessage) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status === "error" || result.status === "fail") {
    throw new Error(result.error || result.message || fallbackMessage);
  }
  return result;
}

export async function signupUser(firstName, lastName, email, password, classLevel) {
  try {
    const resp = await fetch(buildApiUrl("/user/signup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, email, password, classLevel }),
      credentials: "include",
    });

    const data = await resp.json();
    console.log("signup response", data);
    return data;
  } catch (error) {
    console.error("error during signup", error);
    return { status: "error", error };
  }
}
export async function loginUser(email, password) {
  try {
    const resp = await fetch(buildApiUrl("/user/login"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await resp.json();
    console.log("login response", data);

    // server should return { status: "ok", data: { user: {...} } }
    if (data.status !== "ok") {
      console.log("email or password is incorrect");
    }

    return data;
  } catch (error) {
    console.error("error during login", error);
    return { status: "error", error };
  }
}

export async function fetchMe() {
  try {
    const resp = await fetch(buildApiUrl("/user/me"), {
      method: "GET",
      credentials: "include",
    });
    const data = await resp.json();
    if (data?.status === "ok" && data.data?.user) {
      return data.data.user;
    }
  } catch (err) {
    console.error("couldn't fetch /me", err);
  }
}
export async function logOutUser() {
  try {
    const resp = await fetch(buildApiUrl("/user/logout"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (resp.status !== 200) {
      return "Failed to log out";
    }
    return await resp.json();
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

export async function getMyNotifications() {
  try {
    const resp = await fetch(buildApiUrl("/user/notifications"), {
      method: "GET",
      credentials: "include",
    });
    const data = await resp.json();
    return data?.data?.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationsRead() {
  try {
    await fetch(buildApiUrl("/user/notifications/read-all"), {
      method: "PATCH",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
  }
}
export async function getAllUser() {
  try {
    const result = await fetch(buildApiUrl("/admin/allUsers"), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!result.ok) return { status: "failed" };
    return await result.json();
  } catch (error) {
    console.error("Error fetching all users:", error);
    return {};
  }
}
export async function getAdminSummary() {
  const result = await fetch(buildApiUrl("/admin/summary"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return readJsonResponse(result, "Failed to load admin summary");
}

export async function updateUserAccess(userId, payload) {
  try {
    const result = await fetch(buildApiUrl(`/admin/updateUser/${userId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return await result.json();
  } catch (error) {
    console.error("Error updating user access:", error);
    return {};
  }
}
export async function updateUserRole(userId, payload) {
  try {
    const result = await fetch(buildApiUrl(`/admin/updateUserRole/${userId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return await result.json();
  } catch (error) {
    console.error("Error updating user role:", error);
    return {};
  }
}

export async function deleteUser(userId) {
  try {
    const result = await fetch(buildApiUrl(`/admin/deleteUser/${userId}`), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!result.ok) return { status: "failed" };
    return await result.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    return {};
  }
}

export async function updateMyProfile(payload) {
  const response = await fetch(buildApiUrl("/user/me"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const result = await readJsonResponse(response, "Failed to update profile");
  return result.data.user;
}

export async function updateMyPassword(payload) {
  const response = await fetch(buildApiUrl("/user/me/password"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return readJsonResponse(response, "Failed to update password");
}

export async function getSystemSettings() {
  const response = await fetch(buildApiUrl("/admin/settings"), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(response, "Failed to load settings");
  return result.data.settings;
}

export async function upsertSystemSetting(payload) {
  const response = await fetch(buildApiUrl("/admin/settings"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return readJsonResponse(response, "Failed to save settings");
}

export async function reviewResource(resourceId, payload) {
  const response = await fetch(buildApiUrl(`/admin/resources/${resourceId}/review`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return readJsonResponse(response, "Failed to review resource");
}

export async function getBorrowingOverview() {
  const response = await fetch(buildApiUrl("/admin/borrows/overview"), {
    method: "GET",
    credentials: "include",
  });
  const result = await readJsonResponse(
    response,
    "Failed to fetch borrowing overview",
  );
  return result.data;
}
