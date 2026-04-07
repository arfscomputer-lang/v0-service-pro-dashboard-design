import { Settings } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Settings className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Configuración del Sistema</h1>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Gestiona ajustes del sistema, usuarios, permisos y preferencias desde el menú lateral.
      </p>
    </div>
  )
}
