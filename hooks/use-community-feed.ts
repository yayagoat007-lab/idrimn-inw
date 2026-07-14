import { useState, useEffect, useCallback } from 'react';
import { CommunityPost, Comment } from '../types';
import { useAuth } from './use-auth';
import { SEED_POSTS, SEED_COMMENTS } from '../lib/community-seed-data';

export function getUserAlias(fullName: string | null, email: string | null, city: string | null): string {
  const baseName = fullName 
    ? fullName.split(' ')[0] 
    : (email ? email.split('@')[0] : 'FloussiUser');
  
  const cleanName = baseName.replace(/[^a-zA-Z0-9]/g, '');
  const cleanCity = (city || 'Maroc').replace(/[^a-zA-Z0-9]/g, '');
  
  // Use a stable numeric suffix based on the email length or default
  const suffix = email ? (email.length % 100) : '42';
  return `${cleanName}_${cleanCity}${suffix}`;
}

export function useCommunityFeed() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Generate strict anonymized alias for the current active user
  const userAlias = getUserAlias(
    profile?.full_name || null, 
    profile?.email || null, 
    profile?.city || null
  );
  const userCity = profile?.city || 'Maroc';

  // Load posts and comments on mount
  useEffect(() => {
    const localPosts = localStorage.getItem('floussi_community_posts');
    const localComments = localStorage.getItem('floussi_community_comments');

    let initialPosts = SEED_POSTS;
    let initialComments = SEED_COMMENTS;

    if (localPosts) {
      try {
        initialPosts = JSON.parse(localPosts);
      } catch (e) {
        console.error('Error parsing local community posts', e);
      }
    } else {
      localStorage.setItem('floussi_community_posts', JSON.stringify(SEED_POSTS));
    }

    if (localComments) {
      try {
        initialComments = JSON.parse(localComments);
      } catch (e) {
        console.error('Error parsing local community comments', e);
      }
    } else {
      localStorage.setItem('floussi_community_comments', JSON.stringify(SEED_COMMENTS));
    }

    setPosts(initialPosts);
    setComments(initialComments);
    setLoading(false);
  }, []);

  // Save posts to localStorage helper
  const savePosts = useCallback((updatedPosts: CommunityPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('floussi_community_posts', JSON.stringify(updatedPosts));
  }, []);

  // Save comments to localStorage helper
  const saveComments = useCallback((updatedComments: Record<string, Comment[]>) => {
    setComments(updatedComments);
    localStorage.setItem('floussi_community_comments', JSON.stringify(updatedComments));

    // Also update commentsCount in posts
    const localPosts = localStorage.getItem('floussi_community_posts');
    if (localPosts) {
      try {
        const parsedPosts: CommunityPost[] = JSON.parse(localPosts);
        const nextPosts = parsedPosts.map(p => ({
          ...p,
          commentsCount: updatedComments[p.id]?.length || 0
        }));
        setPosts(nextPosts);
        localStorage.setItem('floussi_community_posts', JSON.stringify(nextPosts));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Create a new post
  const createPost = useCallback((content: string, type: 'achievement' | 'tip' | 'question', relatedGoalName?: string) => {
    const newPost: CommunityPost = {
      id: `post-${Math.random().toString(36).substring(2, 11)}`,
      authorAlias: userAlias,
      authorCity: userCity,
      content,
      type,
      relatedGoalName,
      reactions: { '👍': 0, '❤️': 0, '🎉': 0, '🔥': 0, '💡': 0 },
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newPost, ...posts];
    savePosts(updated);

    const userId = profile?.id || "mock-user-id-9999";
    import('../lib/gamification').then(({ unlockGlobalBadge }) => {
      unlockGlobalBadge(userId, 'community_citizen');
    }).catch(err => console.error(err));

    return newPost;
  }, [posts, savePosts, userAlias, userCity]);

  // Add a reaction emoji
  const addReaction = useCallback((postId: string, emoji: string) => {
    const updated = posts.map(post => {
      if (post.id === postId) {
        const reactions = { ...post.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...post, reactions };
      }
      return post;
    });
    savePosts(updated);
  }, [posts, savePosts]);

  // Add a comment to a post
  const addComment = useCallback((postId: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Math.random().toString(36).substring(2, 11)}`,
      postId,
      authorAlias: userAlias,
      content,
      createdAt: new Date().toISOString()
    };

    const postComments = comments[postId] || [];
    const updatedComments = {
      ...comments,
      [postId]: [...postComments, newComment]
    };
    saveComments(updatedComments);
  }, [comments, saveComments, userAlias]);

  return {
    posts,
    comments,
    loading,
    userAlias,
    userCity,
    createPost,
    addReaction,
    addComment
  };
}
