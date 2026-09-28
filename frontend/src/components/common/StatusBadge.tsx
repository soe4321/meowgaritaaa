import React from 'react';
import { ApplicationStatus } from '../../types';
import { CheckCircle2, Clock, ShieldAlert, XCircle, AlertTriangle, Slash, FileText } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3.5 py-1.5 gap-2',
  }[size];

  const config = {
    APPROVED: {
      bg: 'bg-forest-50 border-forest-200 text-forest-800',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />,
      label: 'Approved',
    },
    PENDING_FACULTY: {
      bg: 'bg-mustard-50 border-mustard-200 text-mustard-800',
      icon: <Clock className="w-3.5 h-3.5 text-mustard-600" />,
      label: 'Pending Faculty',
    },
    PENDING_ADMIN: {
      bg: 'bg-terracotta-50 border-terracotta-200 text-terracotta-800',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-terracotta-600" />,
      label: 'Pending Admin',
    },
    REJECTED: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
      label: 'Rejected',
    },
    RETURNED_FOR_CORRECTION: {
      bg: 'bg-amber-50 border-amber-300 text-amber-900',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />,
      label: 'Returned for Correction',
    },
    CANCELLED: {
      bg: 'bg-charcoal-100 border-charcoal-200 text-charcoal-600',
      icon: <Slash className="w-3.5 h-3.5 text-charcoal-500" />,
      label: 'Cancelled',
    },
    SUBMITTED: {
      bg: 'bg-mustard-50 border-mustard-200 text-mustard-800',
      icon: <Clock className="w-3.5 h-3.5 text-mustard-600" />,
      label: 'Submitted',
    },
    DRAFT: {
      bg: 'bg-ivory-200 border-ivory-300 text-charcoal-600',
      icon: <FileText className="w-3.5 h-3.5 text-charcoal-500" />,
      label: 'Draft',
    },
  }[status] || {
    bg: 'bg-ivory-200 border-ivory-300 text-charcoal-600',
    icon: <Clock className="w-3.5 h-3.5 text-charcoal-500" />,
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm font-sans tracking-tight transition-colors ${config.bg} ${sizeClasses}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
