export interface FormContainerProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  disabled?: boolean;
}

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

export interface FormFieldGroupProps {
  children: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  extraActions?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  submitVariant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}
