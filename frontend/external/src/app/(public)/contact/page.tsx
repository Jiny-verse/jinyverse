'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInquiry } from 'common/services';
import { useAuth } from 'common';
import { useLanguage, parseApiError } from 'common/utils';
import { useApiOptions } from '@/app/providers/ApiProvider';

export default function ContactPage() {
  const options = useApiOptions();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isGuest = !user;

  const [guestEmail, setGuestEmail] = useState('');
  const [categoryCode, setCategoryCode] = useState('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CATEGORY_OPTIONS = [
    { value: 'general', label: t('contact.categoryOptions.general') },
    { value: 'bug', label: t('contact.categoryOptions.bug') },
    { value: 'billing', label: t('contact.categoryOptions.billing') },
    { value: 'partnership', label: t('contact.categoryOptions.partnership') },
    { value: 'other', label: t('contact.categoryOptions.other') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createInquiry(options, {
        guestEmail: isGuest ? guestEmail : undefined,
        categoryCode,
        title,
        content,
      });
      router.push(user ? '/inquiries' : '/');
    } catch (err) {
      const { messageKey, fallback } = parseApiError(err);
      setError(t(messageKey) || fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-foreground">{t('contact.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('contact.description')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isGuest && (
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">{t('contact.guestEmail')}</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
              placeholder={t('contact.guestEmailPlaceholder')}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">{t('contact.category')}</label>
          <select
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">{t('contact.titleLabel')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={255}
            placeholder={t('contact.titlePlaceholder')}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">{t('contact.content')}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            placeholder={t('contact.contentPlaceholder')}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? t('contact.submitting') : t('contact.submit')}
        </button>
      </form>
    </div>
  );
}
