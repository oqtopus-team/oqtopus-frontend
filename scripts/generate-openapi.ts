import axios from 'axios';
import * as dotenv from 'dotenv';
import url from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { execa } from 'execa';
import { parseArgs } from 'node:util';
import urlJoin from 'url-join';
import yaml from 'js-yaml';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const __project_root = path.resolve(__dirname, '..');

dotenv.config({ path: __project_root });

function failwith(msg: string, exitCode?: number): never {
  console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`);
  process.exit(exitCode || 1);
}

const printUsageAbort = (): never => {
  console.log(`
Usage: generate-openapi [-h|--help] [--src SRC] [--ref REF] 
                        [-p|--path PATH]

  Generate a bunch of client code for OQTOPUS's OpenAPI Specification (OAS).

Available options:
  --src SRC       The location of OAS yaml file. The SRC must conform to 
                  one of the following formats: 
                    - "github:{GITHUB_OWNER}/{GITHUB_REPO}"
                    - "(http|https)://{DOMAIN}"
  --ref REF       You should use this option only when --src option 
                  is of the "github:" form.
  -p,--path PATH  The path to the OAS yaml file within the location.
  -h,--help       Show this help text.

Example usages:
  1) Use the latest stable version of official specification hosted in GitHub.
      generate-openapi --src github:oqtopus-team/oqtopus-cloud --ref main -p /backend/oas/user/openapi.yaml

  2) Use the local dev server of OQTOPUS cloud running on the same host machine:
      generate-openapi --src http://localhost:8000 -p /oas/user/openapi.yaml
`);
  process.exit(0);
};

interface Options {
  src: string;
  ref: string;
  path: string;
  help: boolean;
}

const mkDocumentURL = (options: Partial<Options>) => {
  const src = options?.src;
  if (!src) {
    failwith('You cannot omit --src option.');
  }

  if (/^github:/.test(src)) {
    const ref = options?.ref;
    if (!ref) {
      failwith('You cannot omit --ref option.');
    }
    const matched = src.match(/github:([^/]+)\/([^/]+)$/);
    const githubOwner = matched?.[1];
    const githubRepo = matched?.[2];
    if (!githubOwner || !githubRepo) {
      failwith('--src is not a valid GitHub location.');
    }
    const objectPath = options['path'];
    return `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/refs/heads/${ref}/${objectPath}`;
  } else if (/^https?:/.test(src)) {
    if (!options?.path) {
      failwith('You cannot omit --path option.');
    }
    const url = urlJoin(src, options?.path);
    return url;
  }
  // else if (/^file:/.test(src)) {
  //   failwith("Sorry, but src file:...")
  // }
  else {
    failwith('Invalid src');
  }
};
(async () => {
  const { values: options } = parseArgs({
    options: {
      src: { type: 'string' },
      ref: { type: 'string' },
      path: { type: 'string', short: 'p' },
      help: { short: 'h', type: 'boolean' },
    },
    args: process.argv.slice(2),
  });

  if (options['help']) {
    printUsageAbort();
  }

  if (!options['src']) {
    failwith('--src options is not specified');
  }

  // Download open-api spec yaml
  const documentURL = mkDocumentURL(options);
  if (!documentURL) {
    failwith('\x1b[31m[ERROR]\x1b[0m Invalid document source.');
  }
  let { data } = await axios.get(documentURL);
  let value = yaml.load(data) as any;
  value.servers = [
    {
      url: process.env.VITE_APP_API_ENDPOINT,
      description: process.env.VITE_APP_API_ENDPOINT_DESCRIPTION
    }
  ];
  data = yaml.dump(value);
  await fs.writeFile(path.join(__project_root, 'src/api/generated/openapi.yaml'), data, 'utf-8');
  await fs.writeFile(path.join(__project_root, 'public/openapi.yaml'), data, 'utf-8');

  // Run generate command in docker
  await execa({
    stdio: 'inherit',
  })`docker run --rm -v ${__project_root}:/workspace openapitools/openapi-generator-cli generate
    -i /workspace/src/api/generated/openapi.yaml
    -g typescript-axios
    -o /workspace/src/api/generated`;

  console.log(''); // for pretty printing
  console.log('\x1b[34m[INFO]\x1b[0m Successfully generated.');
})();
