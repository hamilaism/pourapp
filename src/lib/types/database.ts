export type Database = {
  public: {
    Tables: {
      ingredient: {
        Row: {
          id: string
          workspace_id: string
          name: string
          unit_base: 'g' | 'ml'
          density: number | null
          abv: number | null
          shelf_life_days: number | null
          color_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          unit_base: 'g' | 'ml'
          density?: number | null
          abv?: number | null
          shelf_life_days?: number | null
          color_code?: string | null
        }
        Update: {
          name?: string
          unit_base?: 'g' | 'ml'
          density?: number | null
          abv?: number | null
          shelf_life_days?: number | null
          color_code?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
