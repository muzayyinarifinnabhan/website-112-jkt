/**
 * Modern Confirm Dialog - replaces browser confirm()
 *
 * Usage:
 *   import { useConfirm, ConfirmDialog } from '../../../components/ConfirmDialog'
 *
 *   function MyAdmin() {
 *     const { confirmState, showConfirm } = useConfirm()
 *
 *     const handleDelete = async () => {
 *       const ok = await showConfirm('Hapus item ini?', 'Tindakan ini tidak bisa dibatalkan.')
 *       if (!ok) return
 *       // ... do delete
 *     }
 *
 *     return (
 *       <>
 *         <ConfirmDialog {...confirmState} />
 *         ... your UI ...
 *       </>
 *     )
 *   }
 */

import { useState, useCallback } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export function useConfirm() {
  const [confirmState, setConfirmState] = useState({
    open: false,
    message: '',
    subMessage: '',
    resolve: null,
  })

  const showConfirm = useCallback((message, subMessage = '') => {
    return new Promise((resolve) => {
      setConfirmState({ open: true, message, subMessage, resolve })
    })
  }, [])

  const handleResponse = useCallback((result) => {
    setConfirmState(prev => {
      if (prev.resolve) prev.resolve(result)
      return { open: false, message: '', subMessage: '', resolve: null }
    })
  }, [])

  return {
    confirmState: { ...confirmState, onConfirm: () => handleResponse(true), onCancel: () => handleResponse(false) },
    showConfirm
  }
}

export function ConfirmDialog({ open, message, subMessage, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-4 rounded-2xl">
            <AlertTriangle size={32} className="text-red-500" strokeWidth={2.5} />
          </div>
        </div>

        {/* Message */}
        <h3 className="text-xl font-black text-gray-900 text-center mb-2 leading-snug">
          {message}
        </h3>
        {subMessage && (
          <p className="text-sm text-gray-500 text-center font-medium leading-relaxed mb-6">
            {subMessage}
          </p>
        )}
        {!subMessage && <div className="mb-6" />}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-2xl bg-gray-100 text-gray-600 font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-6 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
