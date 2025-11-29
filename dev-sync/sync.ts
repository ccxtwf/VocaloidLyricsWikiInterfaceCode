import { resolveFileExtension } from '../dev-utils/utils.ts';

import { normalizePath } from "vite";

import { Mwn } from "mwn";

import http from "http";
import https from "https";
import axios from "axios";
import { readdirSync, createWriteStream, existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join, relative, resolve, basename } from "path";
import { exec } from 'child_process';

const EDIT_SUMMARY = 'Automated: Syncing the MediaWiki Interface + Gadgets Code';

const __dirname = import.meta.dirname;
const logsFolderPath = resolve(__dirname, '../logs');
if (!existsSync(logsFolderPath)) { mkdirSync(logsFolderPath); }
const srcPath = resolve(__dirname, '../src');
const distPath = resolve(__dirname, '../dist');
const gadgetsSubfolder = 'gadgets';
const mediawikiSubfolder = 'mediawiki';
const gadgetsDistPath = resolve(distPath, gadgetsSubfolder);
const mediawikiDistPath = resolve(distPath, mediawikiSubfolder);

/* Set Mwn to log to a file */
const currentDate = new Date(Date.now()).toISOString().slice(0, 10);
Mwn.setLoggingConfig({
  stream: createWriteStream(
    resolve(logsFolderPath, `${currentDate}.log`), {
    flags: 'a',
    encoding: 'utf8'
  })
});

function log(message: string) {
  console.log(message);
  Mwn.log(`[I] ${message}`);
}

function resolveEnv(): void {
  const profile = process.env.NODE_PROJECT_PROFILE || null;
  console.log(`Running Node script on profile '${profile ?? 'default'}'`);
  if (profile !== null) process.env.profile = profile;

  const envFilename = `.env${!!profile ? '.' : ''}${profile || ''}`;
  const envFile = resolve(process.cwd(), envFilename);
  if (!existsSync(envFile)) {
    throw new Error(`Cannot find ./${envFilename}!`);
  }
  process.loadEnvFile(envFile);
}

async function initBot(): Promise<Mwn> {
  /* Constructor */
  const bot = new Mwn({
    apiUrl: process.env.WIKI_API_URL,
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_PASSWORD,
    userAgent: process.env.BOT_USERAGENT,
    silent: true,       // suppress messages (except error messages)
    retryPause: 5000,   // pause for 5000 milliseconds (5 seconds) on maxlag error.
    maxRetries: 5       // attempt to retry a failing requests upto 5 times
  });

  /* For non-prod environments, set the bot to transmit requests over insecure HTTP if needed */
  if (process.env.ENV_REJECT_UNAUTHORIZED === '0') {
    log("Setting HTTP Request Agent to not reject unauthorized requests. Do not do this on a production environment.");
    const httpAgent = new http.Agent({ keepAlive: true });
    const httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });
    axios.defaults.httpAgent = httpAgent;
    axios.defaults.httpsAgent = httpsAgent;
    bot.setRequestOptions({ httpAgent, httpsAgent });
  }

  /* Finally login */
  log(`Logging into ${process.env.WIKI_API_URL} as ${process.env.BOT_USERNAME}`);
  await bot.login({
    apiUrl: process.env.WIKI_API_URL,
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_PASSWORD,
  });
  log(`Successfully logged in!`);

  return bot;
}

const rxGadgetFolderStructure = new RegExp(`^${gadgetsSubfolder}\/(?<gadgetId>[^\/]+\/[^\/]+)\/(?<relFilePath>.*)$`);
async function getPagesToUpdate(from?: Date): Promise<Map<string, string>> {
  const res = new Map<string, string>();
  const gadgetsToUpdate = new Set<string>();
  
  let filepaths = await ((from === undefined) ? getAllFilesFromSrc() : getFileChangesFromGit(from));

  for (let filepath of filepaths) {
    if (filepath.startsWith(`${gadgetsSubfolder}/`)) {
      if (basename(filepath) === 'gadgets-definition.yaml') {
        res.set('MediaWiki:Gadgets-definition', resolve(gadgetsDistPath, 'gadgets-definition.wikitext'));
      } else {
        const m = filepath.match(rxGadgetFolderStructure);
        if (m !== null) {
          gadgetsToUpdate.add(m.groups!['gadgetId']!);
        }
      }
    } else if (filepath.startsWith(`${mediawikiSubfolder}/`)) {
      const pagename = resolveFileExtension(basename(filepath));
      res.set(`MediaWiki:${pagename}`, normalizePath(resolve(mediawikiDistPath, pagename)));
    }
  }

  gadgetsToUpdate.forEach(gadgetId => {
    const files = getFilesInGadgetDistFolder(gadgetId);
    files.forEach(file => {
      const pagename = `MediaWiki:Gadget-${basename(file)}`;
      res.set(pagename, file);
    });
  });
  
  return res;
}

async function getAllFilesFromSrc(): Promise<string[]> {
  let entries = readdirSync(srcPath, { withFileTypes: true, recursive: true });
  let results = entries
    .filter(entry => entry.isFile())
    .map(entry => normalizePath(join(relative(srcPath, entry.parentPath), entry.name)));
  return results;
}

function getFileChangesFromGit(from: Date): Promise<string[]> {
  return new Promise((resolve, _) => {
    const cmd = `git log --since="${from.toISOString()}" --name-only --pretty=format: | sort -u | grep -ve "^$"`;
    log(`CMD EXEC: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
        log(`Error: ${error?.message || stderr}`);
        resolve([]);
        return;
      }
      let files = stdout.trim().split('\n');
      // Restrict to files within src/
      files = files
        .filter(file => file.startsWith(`${basename(srcPath)}/`))
        .map(file => file.replace(`${basename(srcPath)}/`, ''));
      resolve(files);
    });
  });
}

function getFilesInGadgetDistFolder(gadgetId: string): string[] {
  const folderPath = resolve(gadgetsDistPath, gadgetId);
  if (!existsSync(folderPath)) {
    return [];
  }
  let entries = readdirSync(folderPath, { withFileTypes: true, recursive: true });
  let results = entries
    .filter(entry => entry.isFile())
    .map(entry => normalizePath(join(entry.parentPath, entry.name)));
  return results;
}

async function syncWikiCode(bot: Mwn, pagesToUpdate: Map<string, string>): Promise<void> {
  log('Syncing wiki code...');
  const failed = await bot.batchOperation(
    Array.from(pagesToUpdate.keys()) as string[],
    async (pageTitle: string, _: number): Promise<any> => {
      const filepath = pagesToUpdate.get(pageTitle)!;
      const src = await readFile(filepath, { encoding: 'utf-8', flag: 'r' });
      await bot.save(pageTitle, src, EDIT_SUMMARY);
      log(`Edited page '${pageTitle}'`);
      return;
    },
    /* concurrencies */ 5,
    /* maxRetries */ 3
  );
  log('Finished syncing wiki code!');
  if (!!failed && !!failed.failures) {
    const errors = Object.entries(failed.failures);
    if (errors.length > 0) {
      log(`Failed to edit the following pages:`);
      errors.forEach(([item, error]) => {
        log(`${item}\t${error}`);
      })
    }
  }
}

async function main() {
  try {
    resolveEnv();
    log("Starting the deploy script...");

    const bot = await initBot();
    
    /* Get last updated time */
    const lastUpdatedLogFileName = `last-updated${!!process.env.profile ? '.' : ''}${process.env.profile || ''}.txt`;
    const lastUpdatedLogFile = resolve(logsFolderPath, lastUpdatedLogFileName);
    let from: Date | undefined;
    if (existsSync(lastUpdatedLogFile)) {
      const rw = await readFile(lastUpdatedLogFile, { encoding: 'utf-8', flag: 'r' });
      const rn = Date.parse(rw.trim());
      if (!isNaN(rn)) {
        from = new Date(rn);
      }
    }

    const pagesToUpdate = await getPagesToUpdate(from);
    syncWikiCode(bot, pagesToUpdate);

    /* Save last updated time for next time */
    await writeFile(lastUpdatedLogFile, new Date(Date.now()).toISOString(), { encoding: 'utf-8', flag: 'w' });
  } catch (err) {
    log(err);
  }
}
main();