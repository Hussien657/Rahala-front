import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import TranslatableText from './TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle, MessageCircle, MoreHorizontal, Reply, RotateCw, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateCommentMutation, useGetTripCommentsQuery, type TripComment, useUpdateCommentMutation, useDeleteCommentMutation } from '@/store/interactionsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CommentSectionProps {
  tripId: string;
}

const CommentSection = ({ tripId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { direction, t } = useLanguage();
  const numericTripId = useMemo(() => Number(tripId), [tripId]);
  const { data, isLoading, isError, refetch } = useGetTripCommentsQuery(tripId);
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const [comments, setComments] = useState<TripComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    if (data?.results) {
      setComments(data.results);
    }
  }, [data]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const created = await createComment({ trip_id: numericTripId, content: newComment, trip: numericTripId }).unwrap();
      setComments(prev => [created, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !user) return;

    setIsSubmitting(true);

    try {
      // Replies API not specified; keeping UI-local optimistic append
      const reply = {
        id: Math.random(),
        user: {
          id: Number(user.id) || 0,
          email: user.email || '',
          username: user.name,
          date_joined: '',
          is_verified: !!user.isVerified,
        },
        trip: numericTripId,
        content: replyContent,
        parent: Number(parentCommentId) || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_reply: true,
        replies: [],
        replies_count: 0,
      } as unknown as TripComment;

      setComments(prev => prev.map(comment =>
        String(comment.id) === parentCommentId
          ? { ...comment, replies: [reply, ...(comment.replies || [])] }
          : comment
      ));

      setReplyContent('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (c: TripComment) => {
    setEditingId(typeof c.id === 'number' ? c.id : null);
    setEditingContent(c.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const submitEdit = async () => {
    if (!editingId || !editingContent.trim()) return;
    try {
      const updated = await updateComment({ pk: editingId, content: editingContent, trip_id: numericTripId }).unwrap();
      setComments(prev => prev.map(c => c.id === updated.id ? updated : c));
      cancelEdit();
    } catch (e) {
      console.error('Failed to update comment', e);
    }
  };

  const submitDelete = async (pk: number) => {
    try {
      await deleteComment({ pk, trip_id: numericTripId }).unwrap();
      setComments(prev => prev.filter(c => c.id !== pk));
    } catch (e) {
      console.error('Failed to delete comment', e);
    }
  };

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: TripComment; isReply?: boolean; parentId?: string }) => {
    const canMutate = user && String(user.id) === String(comment.user.id) && typeof comment.id === 'number';
    return (
      <div className={cn("space-y-3", isReply && (direction === 'rtl' ? "mr-8" : "ml-8"))}>
        <div className={`flex ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={''} alt={comment.user.username} />
            <AvatarFallback>{comment.user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className={`flex items-center mb-1 ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                <span className="font-medium text-sm">
                  {comment.user.username}
                </span>
                {comment.user.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    <TranslatableText staticKey="comments.verified">Verified</TranslatableText>
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="min-h-[80px]"
                    dir={direction}
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={submitEdit} disabled={isUpdating || !editingContent.trim()}>
                      <TranslatableText staticKey="comments.save">Save</TranslatableText>
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isUpdating}>
                      <TranslatableText staticKey="comments.cancel">Cancel</TranslatableText>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap" dir={direction}>
                  {comment.content}
                </p>
              )}
            </div>

            <div className={`flex items-center text-xs ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto font-normal text-gray-500"
                  onClick={() => setReplyTo(replyTo === String(comment.id) ? null : String(comment.id))}
                >
                  <Reply className={`h-3 w-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                  <TranslatableText staticKey="comments.reply">Reply</TranslatableText>
                </Button>
              )}

              {canMutate && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-gray-500"
                    onClick={() => startEdit(comment)}
                    disabled={isUpdating || editingId === comment.id}
                  >
                    <Pencil className={`h-3 w-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                    <TranslatableText staticKey="comments.edit">Edit</TranslatableText>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-red-500"
                    onClick={() => submitDelete(comment.id as number)}
                    disabled={isDeleting}
                  >
                    <Trash2 className={`h-3 w-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                    <TranslatableText staticKey="comments.delete">Delete</TranslatableText>
                  </Button>
                </>
              )}
            </div>

            {/* Reply Form */}
            {replyTo === String(comment.id) && (
              <div className="mt-2 space-y-2">
                <Textarea
                  placeholder={t('comments.replyPlaceholder', 'Write a reply...')}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px]"
                  dir={direction}
                />
                <div className={`flex ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(String(comment.id))}
                    disabled={!replyContent.trim() || isSubmitting}
                  >
                    <TranslatableText staticKey={isSubmitting ? 'comments.posting' : 'comments.reply'}>{isSubmitting ? 'Posting...' : 'Reply'}</TranslatableText>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                  >
                    <TranslatableText staticKey="comments.cancel">Cancel</TranslatableText>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply={true}
                parentId={String(comment.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mt-6" dir={direction}>
      <CardContent className="p-6">
        <div className={`flex items-center mb-4 ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
          <MessageCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            <TranslatableText staticKey="comments.comments">Comments</TranslatableText> ({data?.count ?? comments.length})
          </h3>
          <Button variant="ghost" size="sm" className={`${direction === 'rtl' ? 'mr-auto' : 'ml-auto'}`} onClick={() => refetch()} disabled={isLoading}>
            <RotateCw className={cn(`h-4 w-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`, isLoading && 'animate-spin')} />
            <TranslatableText staticKey="comments.refresh">Refresh</TranslatableText>
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3 mb-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-2/3" />
          </div>
        )}
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              <TranslatableText staticKey="comments.unableToLoadComments">Unable to load comments</TranslatableText>
            </AlertTitle>
            <AlertDescription>
              <TranslatableText staticKey="comments.errorLoadingComments">An error occurred while loading comments. Please try again.</TranslatableText>
            </AlertDescription>
          </Alert>
        )}

        {/* New Comment Form */}
        {user && (
          <div className="mb-6">
            <div className={`flex ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder={t('comments.addCommentPlaceholder', 'Add a comment...')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                  dir={direction}
                />
                <div className={`flex ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting || isCreating}
                  >
                    <TranslatableText staticKey={isSubmitting || isCreating ? 'comments.posting' : 'comments.postComment'}>{isSubmitting || isCreating ? 'Posting...' : 'Post Comment'}</TranslatableText>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>
                <TranslatableText staticKey="comments.noCommentsYet">No comments yet. Be the first to comment!</TranslatableText>
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentSection;
