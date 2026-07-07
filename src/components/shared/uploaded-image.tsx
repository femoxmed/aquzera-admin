import React, { useState } from 'react';
import {
	deleteUploadedFile,
	deleteProductImage,
} from '@/features/products/api';
import { toast } from 'react-hot-toast';
import { resolveMediaUrl, uploadKeyFromUrl } from '@/lib/media-url';
import { Modal } from './modal';

interface UploadedImageProps {
	url: string;
	onDelete?: () => void;
	productId?: string;
	imageField?: 'bannerImage' | 'mainImage' | 'galleryImages';
	imageIndex?: number;
	size?: 'sm' | 'md' | 'lg';
	label?: string;
}

export const UploadedImage: React.FC<UploadedImageProps> = ({
	url,
	onDelete,
	productId,
	imageField,
	imageIndex,
	size = 'md',
	label = 'image',
}) => {
	const [deleting, setDeleting] = useState(false);
	const [imageFailed, setImageFailed] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const imageUrl = resolveMediaUrl(url) ?? url;

	const handleDelete = async () => {
		setDeleting(true);

		try {
			const isLocalPreview =
				url.startsWith('blob:') || url.startsWith('data:');

			if (isLocalPreview) {
				onDelete?.();
				return;
			}

			if (productId && imageField) {
				await deleteProductImage(productId, imageField, imageIndex);
			} else {
				const key = uploadKeyFromUrl(url);
				await deleteUploadedFile(key);
			}

			toast.success('Image deleted successfully');
			onDelete?.();
			setConfirmingDelete(false);
		} catch (err) {
			toast.error('Failed to delete image');
		} finally {
			setDeleting(false);
		}
	};

	const sizeClasses = {
		sm: 'h-20 w-20',
		md: 'h-32 w-32',
		lg: 'h-48 w-48',
	};

	return (
		<>
			<div
				className={`relative rounded-lg overflow-hidden ${sizeClasses[size]} group`}>
				{imageFailed ? (
					<div className='flex h-full w-full items-center justify-center border border-dashed border-slate-300 bg-slate-50 px-2 text-center text-xs text-slate-500'>
						Image unavailable
					</div>
				) : (
					<img
						src={imageUrl}
						alt='Uploaded image'
						className='w-full h-full object-cover'
						onError={() => setImageFailed(true)}
					/>
				)}

				<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center'>
					<button
						onClick={() => setConfirmingDelete(true)}
						disabled={deleting}
						className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg disabled:opacity-50'>
						{deleting ? (
							<svg
								className='animate-spin h-4 w-4'
								fill='none'
								viewBox='0 0 24 24'>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
								/>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
								/>
							</svg>
						) : (
							<svg
								className='h-4 w-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
								/>
							</svg>
						)}
					</button>
				</div>
			</div>

			<Modal
				open={confirmingDelete}
				title={`Delete this ${label}?`}
				description='This removes the image from the product and storage.'
				onClose={() => {
					if (!deleting) {
						setConfirmingDelete(false);
					}
				}}
				footer={
					<>
						<button
							type='button'
							className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700'
							disabled={deleting}
							onClick={() => setConfirmingDelete(false)}>
							Cancel
						</button>
						<button
							type='button'
							className='rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60'
							disabled={deleting}
							onClick={handleDelete}>
							{deleting ? 'Deleting...' : 'Delete image'}
						</button>
					</>
				}>
				<div className='flex items-center gap-4'>
					<div className='h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50'>
						{imageFailed ? (
							<div className='flex h-full w-full items-center justify-center px-2 text-center text-xs text-slate-500'>
								Unavailable
							</div>
						) : (
							<img
								src={imageUrl}
								alt='Selected image'
								className='h-full w-full object-cover'
								onError={() => setImageFailed(true)}
							/>
						)}
					</div>
					<p className='text-sm leading-6 text-slate-600'>
						This action cannot be undone. You can upload a replacement image
						after deleting this one.
					</p>
				</div>
			</Modal>
		</>
	);
};
