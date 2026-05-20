export const MOCK_USERS = [
  {
    id: 1,
    name: "Alex Student",
    email: "student@greenlib.com",
    role: "student",
  },
  { id: 2, name: "Dr. Sarah", email: "teacher@greenlib.com", role: "teacher" },
  {
    id: 3,
    name: "John Librarian",
    email: "librarian@greenlib.com",
    role: "librarian",
  },
  { id: 4, name: "Admin User", email: "admin@greenlib.com", role: "admin" },
];

export const INITIAL_RESOURCES = [
  {
    id: 1,
    title: "Quantum Physics Intro",
    author: "Niels Bohr",
    category: "Science",
    type: "textbook",
    uploadedBy: "Librarian John",
    date: "2023-10-01",
  },
  {
    id: 2,
    title: "Calculus II Workbook",
    author: "Leithold",
    category: "Mathematics",
    type: "document",
    uploadedBy: "Dr. Sarah",
    date: "2023-11-15",
  },
];

export const RANKED_RESOURCES = [
  { id: 1, title: "Calculus II Workbook", rating: 4.5, votes: 34 },
  { id: 2, title: "Quantum Physics Intro", rating: 4.8, votes: 52 },
];

export const VIDEO_RESOURCES = [
  {
    id: 1,
    title: "Introduction to Quantum Mechanics",
    description:
      "A short explainer video covering the basics of quantum theory.",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: 2,
    title: "Calculus Limits Explained",
    description: "Teacher walkthrough of limit problems with visual aids.",
    url: "https://www.w3schools.com/html/movie.mp4",
  },
];
