import { GadgetDefinition } from "./GadgetDefinition.ts";

/**
 * Schema for gadgets-definition.yaml
 */
export interface ParsedGadgetsDefinition {
  workspace: {
    // If enable_all is set to true, the build tool will include all gadgets except those in "workspace.disable"
    // If enable_all is set to false, the build tool will only include gadgets listed in "workspace.enable"
    enable_all?: boolean;
    enable?: string[];
    disable?: string[];
  };
  gadgets: {
    [GadgetSectionName: string]: {
      [GadgetName: string]: GadgetDefinition;
    };
  };
}

export interface GadgetsDefinition extends ParsedGadgetsDefinition {}