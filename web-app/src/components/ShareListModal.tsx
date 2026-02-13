import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { sharingService } from '../services/sharing.service';
import {
  ShareRole,
  ListShare,
  ApiError,
} from '@tasks-management/frontend-services';
import { formatApiError } from '../utils/formatApiError';

interface ShareListModalProps {
  listId: string;
  listName: string;
  onClose: () => void;
}

export default function ShareListModal({
  listId,
  listName,
  onClose,
}: ShareListModalProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ShareRole>(ShareRole.EDITOR);
  const isRtl = i18n.dir() === 'rtl';

  const { data: shares = [], isLoading } = useQuery<ListShare[], ApiError>({
    queryKey: ['shares', listId],
    queryFn: () => sharingService.getListShares(listId),
  });

  const shareMutation = useMutation<
    ListShare,
    ApiError,
    { email: string; role: ShareRole }
  >({
    mutationFn: (data) => sharingService.shareList(listId, data),
    onSuccess: () => {
      setEmail('');
      toast.success(
        t('sharing.shareSuccess', { defaultValue: 'List shared successfully' })
      );
      void queryClient.invalidateQueries({ queryKey: ['shares', listId] });
    },
    onError: (err) => {
      toast.error(formatApiError(err, t('sharing.shareFailed')));
    },
  });

  const unshareMutation = useMutation<void, ApiError, string>({
    mutationFn: (userId) => sharingService.unshareList(listId, userId),
    onSuccess: () => {
      toast.success(
        t('sharing.unshareSuccess', { defaultValue: 'User removed' })
      );
      void queryClient.invalidateQueries({ queryKey: ['shares', listId] });
    },
    onError: (err) => {
      toast.error(formatApiError(err, t('sharing.unshareFailed')));
    },
  });

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    shareMutation.mutate({ email: email.trim(), role });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border-subtle overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
          <h3 className="text-xl font-bold text-primary">
            {t('sharing.title')}:{' '}
            <span className="text-accent">{listName}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-tertiary hover:bg-hover transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Form */}
          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-tertiary mb-2">
                {t('sharing.shareWith')}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('sharing.emailPlaceholder')}
                  className="premium-input flex-1"
                  required
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ShareRole)}
                  className="premium-input w-32"
                >
                  <option value={ShareRole.EDITOR}>
                    {t('sharing.roles.EDITOR')}
                  </option>
                  <option value={ShareRole.VIEWER}>
                    {t('sharing.roles.VIEWER')}
                  </option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={shareMutation.isPending || !email.trim()}
              className="premium-button w-full flex items-center justify-center gap-2"
            >
              {shareMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              )}
              {t('sharing.shareButton')}
            </button>
          </form>

          {/* Shares List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-tertiary px-1">
              {t('sharing.sharedWith')}
            </h4>
            <div className="max-h-60 overflow-y-auto pr-1 -mr-1 space-y-2">
              {isLoading ? (
                <div className="py-4 text-center text-tertiary">
                  <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-2" />
                  {t('common.loading')}
                </div>
              ) : shares.length === 0 ? (
                <div className="py-4 text-center text-tertiary text-sm">
                  {t('sharing.noShares')}
                </div>
              ) : (
                shares.map((share) => (
                  <div
                    key={share.id}
                    className={`flex items-center justify-between p-3 rounded-xl bg-hover border border-border-subtle group ${isRtl ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                        {(
                          share.sharedWith?.name?.[0] ||
                          share.sharedWith?.email?.[0] ||
                          '?'
                        ).toUpperCase()}
                      </div>
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <p className="text-sm font-semibold text-primary line-clamp-1">
                          {share.sharedWith?.name ||
                            share.sharedWith?.email ||
                            t('common.unknownUser')}
                        </p>
                        <p className="text-xs text-tertiary uppercase">
                          {t(`sharing.roles.${share.role}`)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const email = share.sharedWith?.email || '';
                        if (
                          window.confirm(t('sharing.unshareConfirm', { email }))
                        ) {
                          unshareMutation.mutate(share.sharedWithId);
                        }
                      }}
                      className="p-2 rounded-lg text-tertiary hover:text-accent-danger hover:bg-accent-danger/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-hover/50 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl border border-border-subtle text-secondary font-semibold hover:bg-surface transition-all"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
