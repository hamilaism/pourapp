"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Trash2 } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  itemName: string
  itemType: string
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(false)

  const isConfirmValid = confirmText === "SUPPRIMER"

  useEffect(() => {
    if (isOpen) {
      setConfirmText("")
      setError(false)
    }
  }, [isOpen])

  const handleConfirm = async () => {
    if (!isConfirmValid) {
      setError(true)
      return
    }

    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      console.error("Delete failed:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleInputChange = (value: string) => {
    setConfirmText(value)
    if (error && value === "SUPPRIMER") {
      setError(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Supprimer {itemType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-foreground">'{itemName}'</span> ?
          </p>

          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Cette action est irréversible.</p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-medium">
              Tapez <span className="font-bold">SUPPRIMER</span> pour confirmer
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="SUPPRIMER"
              className={`${
                error
                  ? "border-red-500 focus-visible:ring-red-500"
                  : isConfirmValid
                    ? "border-green-500 focus-visible:ring-green-500"
                    : ""
              }`}
              disabled={isDeleting}
              autoFocus
            />
            {error && <p className="text-xs text-red-600">Le texte ne correspond pas. Tapez exactement "SUPPRIMER".</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
