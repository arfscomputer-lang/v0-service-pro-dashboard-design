"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteTechDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  techName: string
  onConfirm: () => void
}

export function DeleteTechDialog({ open, onOpenChange, techName, onConfirm }: DeleteTechDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Eliminar Tecnico</AlertDialogTitle>
          <AlertDialogDescription>
            Esta accion eliminara permanentemente a <strong className="text-foreground">{techName}</strong> del
            sistema. Se perderan todos los datos asociados, incluyendo historial de tareas y certificaciones.
            Esta accion no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Eliminar Tecnico
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
