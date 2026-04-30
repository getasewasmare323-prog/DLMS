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

export const FORUM_THREADS = [
  {
    id: 1,
    topic: "Understanding Quantum Mechanics",
    starter: "student@greenlib.com",
    replies: 12,
    lastPost: "2 hours ago",
  },
  {
    id: 2,
    topic: "Best Practices for Teaching Algebra",
    starter: "teacher@greenlib.com",
    replies: 5,
    lastPost: "1 day ago",
  },
];

export const FORUM_POSTS = [
  {
    id: 1,
    threadId: 1,
    author: "Alex Student",
    content: "Can someone explain wave-particle duality?",
    time: "3 hours ago",
  },
  {
    id: 2,
    threadId: 1,
    author: "Dr. Sarah",
    content:
      "Think of electrons as having both properties depending on how you measure them.",
    time: "2 hours ago",
  },
  {
    id: 3,
    threadId: 2,
    author: "Dr. Sarah",
    content:
      "Make sure you provide real-world examples to keep students engaged.",
    time: "1 day ago",
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
