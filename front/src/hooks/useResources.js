import { useQuery } from "@tanstack/react-query";
import {
  getBookmarks,
  getAllBooks,
  getAllVideos,
  getLearningDashboard,
  getManagedResources,
  getMyBorrows,
  getOverdueBorrows,
  getReadingLists,
  getResourceById,
  searchResources,
  getTeacherMaterials,
  getTextbooks,
  getMyReservations,
} from "../data/resourceEndpoint";
import { getAllUser } from "../data/userEndPoint";
import { useUser } from "./useUser";

export function useVideos() {
  const { user } = useUser();
  const {
    data: videos,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: getAllVideos,
    enabled: !!user, // Only fetch videos if user is logged in
  });
  return { videos, error, isLoading };
}

export function useBooks() {
  const { user } = useUser();
  const {
    data: books,
    error,
    isLoading: queryLoading,
  } = useQuery({
    queryKey: ["books"],
    queryFn: getAllBooks,
    enabled: !!user, // Only fetch books if user is logged in
  });
  return { books, error, isLoading: queryLoading };
}
export function useTextbooks() {
  const { user } = useUser();
  const {
    data: books,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["textbooks"],
    queryFn: getTextbooks,
    enabled: !!user,
  });
  return { books, error, isLoading };
}

export function useTeacherMaterials() {
  const { user } = useUser();
  const {
    data: materials,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["teacher-materials"],
    queryFn: getTeacherMaterials,
    enabled: !!user,
  });
  return { materials, error, isLoading };
}

export function useAllUsers() {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUser,
    enabled: !!user && user.role === "admin",
  });
  console.log("all users from hook", data);
  console.log("error fetching all users", error);
  return { data, error, isLoading };
}

export function useResourceSearch(filters) {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["resource-search", filters],
    queryFn: () => searchResources(filters),
    enabled: !!user,
  });
  return { resources: data || [], error, isLoading };
}

export function useResource(resourceId) {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["resource", resourceId],
    queryFn: () => getResourceById(resourceId),
    enabled: !!user && !!resourceId,
  });
  return { resource: data, error, isLoading };
}

export function useLearningDashboard() {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["learning-dashboard"],
    queryFn: getLearningDashboard,
    enabled: !!user,
  });
  return { dashboard: data, error, isLoading };
}

export function useMyBorrows() {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["borrows"],
    queryFn: getMyBorrows,
    enabled: !!user,
  });
  return { borrows: data || [], error, isLoading };
}

export function useBookmarks() {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
    enabled: !!user && (user.role === "teacher" || user.role === "student"),
  });
  return { bookmarks: data || [], error, isLoading };
}

export function useReadingLists() {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["reading-lists"],
    queryFn: getReadingLists,
    enabled: !!user && (user.role === "teacher" || user.role === "student"),
  });
  return { readingLists: data || [], error, isLoading };
}

export function useManagedResources() {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["managed-resources"],
    queryFn: getManagedResources,
    enabled: !!user && (user.role === "teacher" || user.role === "librarian"),
  });
  return { resources: data || [], error, isLoading };
}

export function useOverdueBorrows() {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["overdue-borrows"],
    queryFn: getOverdueBorrows,
    enabled: !!user && (user.role === "admin" || user.role === "librarian"),
  });
  return { overdueBorrows: data || [], error, isLoading };
}

export function useMyReservations() {
  const { user } = useUser();
  const { data, error, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: getMyReservations,
    enabled: !!user,
  });
  return { reservations: data || [], error, isLoading };
}
