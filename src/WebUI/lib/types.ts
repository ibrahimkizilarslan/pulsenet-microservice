export type AuthResponse = {
  token: string;
  username: string;
};

export type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  tags: string[];
  likeCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Follow = {
  id: string;
  followerId: string;
  followeeId: string;
  createdAt: string;
};

export type TimelineEntry = {
  id: string;
  userId: string;
  postId: string;
  authorId: string;
  content: string;
  postCreatedAt: string;
  addedAt: string;
};

