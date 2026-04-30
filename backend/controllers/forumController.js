const { ForumPost, ForumThread, Notification, User } = require("../models");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../middleware/emailService");

const formatUser = (user) => {
  if (!user) return null;
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    classLevel: user.classLevel,
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
  };
};

exports.getThreads = async (req, res) => {
  try {
    const threads = await ForumThread.findAll({
      include: [
        {
          model: User,
          as: "starter",
          attributes: ["userId", "firstName", "lastName", "role", "classLevel"],
        },
        {
          model: ForumPost,
          as: "posts",
          include: [
            {
              model: User,
              as: "author",
              attributes: ["userId", "firstName", "lastName", "role"],
            },
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    const data = threads.map((thread) => {
      const posts = [...(thread.posts || [])].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      const lastPost = posts[posts.length - 1];

      return {
        threadId: thread.threadId,
        topic: thread.topic,
        starter: formatUser(thread.starter),
        repliesCount: Math.max(posts.length - 1, 0),
        postsCount: posts.length,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastPost: lastPost
          ? {
              createdAt: lastPost.createdAt,
              author: formatUser(lastPost.author),
            }
          : null,
      };
    });

    res.status(200).json({ status: "ok", data: { threads: data } });
  } catch (error) {
    console.error("Forum thread fetch error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.getThreadById = async (req, res) => {
  try {
    const thread = await ForumThread.findOne({
      where: { threadId: req.params.id },
      include: [
        {
          model: User,
          as: "starter",
          attributes: ["userId", "firstName", "lastName", "role", "classLevel"],
        },
        {
          model: ForumPost,
          as: "posts",
          include: [
            {
              model: User,
              as: "author",
              attributes: ["userId", "firstName", "lastName", "role", "classLevel"],
            },
          ],
        },
      ],
      order: [[{ model: ForumPost, as: "posts" }, "createdAt", "ASC"]],
    });

    if (!thread) {
      return res.status(404).json({ status: "fail", error: "Thread not found" });
    }

    const posts = [...(thread.posts || [])]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((post) => ({
        postId: post.postId,
        content: post.content,
        createdAt: post.createdAt,
        author: formatUser(post.author),
      }));

    res.status(200).json({
      status: "ok",
      data: {
        thread: {
          threadId: thread.threadId,
          topic: thread.topic,
          starter: formatUser(thread.starter),
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          posts,
        },
      },
    });
  } catch (error) {
    console.error("Forum thread detail error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.createThread = async (req, res) => {
  const { topic, content } = req.body;

  if (!topic || !content) {
    return res
      .status(400)
      .json({ status: "fail", error: "Topic and content are required" });
  }

  try {
    const thread = await ForumThread.create({
      threadId: uuidv4(),
      topic: topic.trim(),
      starterId: req.user.userId,
    });

    await ForumPost.create({
      postId: uuidv4(),
      content: content.trim(),
      threadId: thread.threadId,
      authorId: req.user.userId,
    });

    res.status(201).json({
      status: "ok",
      data: { threadId: thread.threadId },
    });
  } catch (error) {
    console.error("Forum thread creation error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};

exports.createPost = async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res
      .status(400)
      .json({ status: "fail", error: "Reply content is required" });
  }

  try {
    const thread = await ForumThread.findOne({
      where: { threadId: req.params.id },
      include: [
        {
          model: User,
          as: "starter",
          attributes: ["userId", "firstName", "lastName", "email"],
        },
      ],
    });

    if (!thread) {
      return res.status(404).json({ status: "fail", error: "Thread not found" });
    }

    const post = await ForumPost.create({
      postId: uuidv4(),
      content: content.trim(),
      threadId: thread.threadId,
      authorId: req.user.userId,
    });

    if (thread.starterId !== req.user.userId) {
      await Notification.create({
        notificationId: uuidv4(),
        title: `New reply in "${thread.topic}"`,
        message: `${req.user.firstName || "A student"} replied to your study discussion.`,
        read: false,
        userId: thread.starterId,
      });

      if (thread.starter?.email) {
        const replierName =
          [req.user.firstName, req.user.lastName].filter(Boolean).join(" ").trim() ||
          "A student";

        try {
          await sendMail({
            email: thread.starter.email,
            subject: `New reply in "${thread.topic}"`,
            html: `
              <h2>New forum reply</h2>
              <p>Hello ${thread.starter.firstName || "there"},</p>
              <p>${replierName} replied to your forum discussion.</p>
              <p><strong>Topic:</strong> ${thread.topic}</p>
              <p><strong>Reply:</strong> ${content.trim()}</p>
            `,
          });
          console.log(
            `[email] Forum reply notification sent to ${thread.starter.email}`,
          );
        } catch (mailError) {
          console.error(
            `[email] Forum reply notification failed for ${thread.starter.email}: ${mailError.message}`,
          );
        }
      }
    }

    res.status(201).json({
      status: "ok",
      data: {
        post: {
          postId: post.postId,
          content: post.content,
          createdAt: post.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Forum reply creation error:", error.message);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
};
