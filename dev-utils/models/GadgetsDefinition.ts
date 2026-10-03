import GadgetDefinition from "./GadgetDefinition.ts";
import type {
  ParsedGadgetsDefinition,
  GadgetsDefinition as IGadgetsDefinition,
} from "../interfaces/GadgetsDefinition.ts";

export default class GadgetsDefinition implements IGadgetsDefinition {
  workspace: { enable_all?: boolean; enable?: string[]; disable?: string[] };
  gadgets: Record<string, Record<string, GadgetDefinition>>;
  _flatMap: Record<string, GadgetDefinition>;

  constructor(defs: ParsedGadgetsDefinition) {
    this.workspace = defs.workspace;
    this.gadgets = {};
    for (const [gadgetSectionName, gadgetSection] of Object.entries(defs.gadgets)) {
      const _acc: Record<string, GadgetDefinition> = {};
      for (const [gadgetName, gadgetDefinition] of Object.entries(gadgetSection)) {
        _acc[gadgetName] = new GadgetDefinition(gadgetDefinition, gadgetSectionName, gadgetName);
      }
      this.gadgets[gadgetSectionName] = _acc;
    }
    this.setFlatMap();
  }

  private setFlatMap() {
    this._flatMap = Object.values(this.gadgets).reduce((record, section) => {
      record = { ...record, ...section };
      return record;
    }, {});
  }

  private isGadgetEnabled(gadgetDefinition: GadgetDefinition): boolean {
    const gadgetId = gadgetDefinition.getGadgetId();
    return (
      !gadgetDefinition.disabled &&
      (this.workspace.enable_all
        ? (this.workspace.disable ?? []).indexOf(gadgetId) < 0
        : (this.workspace.enable ?? []).indexOf(gadgetId) > -1)
    );
  }

  /**
   * Iterates through every gadget defined in the file
   *
   * @param options
   * @param options.enabledGadgets  Only filter for enabled gadgets
   * @param options.disabledGadgets  Only filter for disabled gadgets
   */
  *getGadgets({
    enabledOnly,
    disabledOnly,
  }: { enabledOnly?: boolean; disabledOnly?: boolean } = {}): Generator<
    [string, string, GadgetDefinition, boolean]
  > {
    for (const [sectionName, gadgetSection] of Object.entries(this.gadgets)) {
      for (const [gadgetName, gadgetDefinition] of Object.entries(gadgetSection)) {
        const isEnabled = this.isGadgetEnabled(gadgetDefinition);
        if ((enabledOnly && !isEnabled) || (disabledOnly && isEnabled)) {
          continue;
        }
        yield [sectionName, gadgetName, gadgetDefinition, isEnabled];
      }
    }
  }

  /**
   * Lookup gadget definition by name
   *
   * @param gadgetName
   * @returns
   */
  getGadgetByName(gadgetName: string | null): GadgetDefinition | null {
    if (!gadgetName) {
      return null;
    }
    return this._flatMap[gadgetName] ?? null;
  }
}