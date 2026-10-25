import { parse, compileScript, compileStyleAsync } from "vue/compiler-sfc";
import { transform } from "oxc-transform";
import type { PluginContext } from "rolldown";
import { basename, extname } from "path";

function getFileName(filepath: string, withExtension: boolean = true): string {
  return basename(filepath, withExtension ? undefined : extname(filepath));
}

function wrap(
  tag: "template" | "style" | "script",
  contents?: string,
  attributes: Record<string, string> = {},
): string | null {
  if (!contents) {
    return null;
  }
  const hasAttributes = Object.entries(attributes).length > 0;
  const openingTag = `<${tag}${
    hasAttributes
      ? Object.entries(attributes)
          .map(([key, value]) => {
            return `${key}="${value}"`;
          })
          .join(" ")
      : ""
  }>`;
  const closingTag = `</${tag}>`;
  return `${openingTag}${contents}${closingTag}`;
}

function formatErrorMessage({ name, message, cause = "", stack = "" }: Error) {
  return ` - ${name} ${message} [${cause}${stack}]`;
}

export async function compileVueComponent(
  ctx: PluginContext,
  src: string,
  filename: string,
): Promise<string> {
  const parsed = parse(src, { filename });
  if (parsed.errors.length) {
    ctx.error(
      `Encountered the following errors when parsing ${filename}:\n${parsed.errors
        .map(formatErrorMessage)
        .join("\n")}`,
    );
  }

  const componentId = getFileName(filename, false);
  const parsedTemplate = parsed.descriptor.template;
  if (!parsedTemplate?.content) {
    ctx.error(`Unable to parse template for file: ${filename}`);
  }

  const parsedScript = compileScript(parsed.descriptor, { id: componentId });
  if (!parsedScript.content) {
    for (const warning of parsedScript.warnings || []) {
      ctx.warn(warning);
    }
    ctx.error(`Unable to parse script for file: ${filename}`);
  }
  const compiledScript = await transform(filename, parsedScript.content!, {
    lang: parsedScript.lang as "js" | "ts",
    sourceType: "commonjs",
    assumptions: {
      setPublicClassFields: true,
    },
  });
  for (const error of compiledScript.errors || []) {
    ctx.warn(`Unable to parse script for file: ${filename}`);
    ctx.warn(error);
  }
  // Convert `export default` to `module.exports` via simple search & replace
  compiledScript.code =
    "\n" + compiledScript.code.replaceAll(/export\s+default/g, "module.exports =");

  const parsedStyles = await Promise.all(
    parsed.descriptor.styles.map((style) =>
      compileStyleAsync({
        ...style,
        source: filename,
        filename,
        id: componentId,
      }),
    ),
  );
  const parsedStyleErrors = parsedStyles.flatMap(({ errors }) => errors);
  if (parsedStyleErrors.length > 0) {
    ctx.error(
      `Encountered error when parsing styles in ${filename}:\n${parsedStyleErrors.map((err) => err.message)}`,
    );
  }
  const templateBlock = wrap("template", parsedTemplate?.content);
  const scriptBlock = wrap("script", compiledScript.code);
  const genStyleBlocks = parsedStyles.map(({ code }) => wrap("style", code));
  const generatedCode = `${templateBlock}\n\n${scriptBlock}${genStyleBlocks.length ? "\n\n" : ""}${genStyleBlocks.join("\n")}`;

  return generatedCode;
}