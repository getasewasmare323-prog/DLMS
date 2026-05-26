import { buildApiUrl } from "../lib/api";

export async function createExercise(payload) {
  const response = await fetch(buildApiUrl("/teacher/exercises"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.message || data.error || "Failed to create exercise");
  }

  return data.data.exercise;
}

export async function updateExercise(exerciseId, payload) {
  const response = await fetch(
    buildApiUrl(`/teacher/exercises/${exerciseId}`),
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.message || data.error || "Failed to update exercise");
  }

  return data.data.exercise;
}

export async function deleteExercise(exerciseId) {
  const response = await fetch(
    buildApiUrl(`/teacher/exercises/${exerciseId}`),
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.message || data.error || "Failed to delete exercise");
  }

  return data.data;
}

export async function getMyTeacherExercises() {
  const response = await fetch(buildApiUrl("/teacher/exercises"), {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.message || data.error || "Failed to load exercises");
  }

  return data.data.exercises;
}

export async function getExercises() {
  const response = await fetch(buildApiUrl("/exercises"), {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.message || data.error || "Failed to load exercises");
  }

  return data.data.exercises;
}

export async function getExerciseById(exerciseId) {
  const response = await fetch(buildApiUrl(`/exercises/${exerciseId}`), {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(data.message || data.error || "Failed to load exercise");
  }

  return data.data.exercise;
}
