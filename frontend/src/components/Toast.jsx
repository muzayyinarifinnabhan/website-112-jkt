/**
 * Toast Notification System
 * 
 * Usage:
 *   import { useToast, ToastContainer } from '../../../components/Toast'
 *   
 *   function MyAdmin() {
 *     const { toasts, toast } = useToast()
 *     
 *     // Inside your handlers:
 *     toast.success('Data berhasil disimpan!')
 *     toast.error('Gagal: ' + error.message)
 *     toast.info('Memproses data...')
 *     toast.warning('Harap isi semua field wajib.')
 *     
 *     return (
 *       <>
 *         <ToastContainer toasts={toasts} />
 *         ... your UI ...
 *       </>
 *     )
 *   }
 */

import { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

let idCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error', 5000),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  }

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, removeToast }
}

const CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    text: 'text-emerald-900',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    text: 'text-red-900',
    bar: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    text: 'text-amber-900',
    bar: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    text: 'text-blue-900',
    bar: 'bg-blue-500',
  },
}

function Toast({ toast, onRemove }) {
  const cfg = CONFIG[toast.type] || CONFIG.info
  const Icon = cfg.icon

  return (
    <div
      className={`
        relative flex items-start gap-4 p-4 pr-10 rounded-2xl border shadow-2xl shadow-black/10
        backdrop-blur-sm min-w-[300px] max-w-sm
        ${cfg.bg} ${cfg.border}
        animate-in slide-in-from-right-8 fade-in duration-300
      `}
    >
      {/* Colored bar on left */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${cfg.bar}`} />

      <div className={`flex-shrink-0 mt-0.5 ${cfg.iconColor}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>

      <p className={`text-sm font-bold leading-relaxed flex-1 ${cfg.text}`}>
        {toast.message}
      </p>

      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onRemove={onRemove || (() => {})} />
        </div>
      ))}
    </div>
  )
}
