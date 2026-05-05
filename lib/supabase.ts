import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

export const PHOTOS_BUCKET = "work-order-photos"

export async function uploadPhoto(
  base64: string,
  path: string,
  mimeType = "image/jpeg"
): Promise<string> {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "")
  const buffer = Buffer.from(base64Data, "base64")

  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false })

  if (error) throw new Error(`Supabase upload failed: ${error.message}`)

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
