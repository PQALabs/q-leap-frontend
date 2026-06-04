'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getAvatarPresignedUrlRequest, updateUserProfileRequest, uploadAvatarToObs } from '@/api/user/requests';
import { queryKeys } from '@/constants/query-keys';

const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'] as const;
type AvatarExtension = (typeof ACCEPTED_EXTENSIONS)[number];

const MIME_TO_EXT: Record<string, AvatarExtension> = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  username: string | null;
}

export function AvatarUpload({ currentAvatarUrl, username }: AvatarUploadProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const displayUrl = previewUrl ?? currentAvatarUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      toast.error('Unsupported file type', { description: 'Please upload a PNG, JPG, JPEG, WebP, or GIF image.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Avatar must be under 5 MB.' });
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const localPreview = URL.createObjectURL(file);
    previewUrlRef.current = localPreview;
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const { presignedUrl, publicUrl } = await getAvatarPresignedUrlRequest({ extension: ext });
      await uploadAvatarToObs(presignedUrl, file);
      await updateUserProfileRequest({ avatarUrl: publicUrl });
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      toast.success('Avatar updated');
    } catch {
      setPreviewUrl(null);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className='flex flex-col items-center gap-3'>
      <div className='relative'>
        <div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted'>
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={username ?? 'Avatar'}
              width={96}
              height={96}
              className='h-full w-full object-cover'
              unoptimized
            />
          ) : (
            <User size={40} className='text-muted-foreground' />
          )}
        </div>

        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className='absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-accent disabled:opacity-60'
          aria-label='Change avatar'
        >
          {isUploading ? <Loader2 size={13} className='animate-spin' /> : <Camera size={13} />}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/png,image/jpg,image/jpeg,image/webp,image/gif'
        className='hidden'
        onChange={handleFileChange}
      />
    </div>
  );
}
