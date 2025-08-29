interface GadgetDefinition {
  requires?: string[]
  scripts?: string[]
  styles?: string[]
  i18n?: string[]
  subdir?: string
  disabled?: boolean
}

interface GadgetsDefinition {
  workspace: {
    enable_all?: boolean
    enable?: string[]
    disable?: string[]
  }
  gadgets: {
    [Key: string]: GadgetDefinition
  }
}