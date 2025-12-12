# OQTOPUS Frontend

![OQTOPUS](./public/img/common/logo/oqtopus.png "oqtopus")

The web-based frontend application for OQTOPUS.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![slack](https://img.shields.io/badge/slack-OQTOPUS-pink.svg?logo=slack&style=plastic")](https://join.slack.com/t/oqtopus/shared_invite/zt-3bpjb7yc3-Vg8IYSMY1m5wV3DR~TMSnw)

## Overview

### Requirements for Development

- [bun](https://bun.sh/)
- Working deployments of [OQTOPUS cloud](https://github.com/oqtopus-team/oqtopus-cloud.git)

## Production Deployment

The OQTOPUS frontend is deployed to AWS Amplify.
Unfortunately, you will need to set up the AWS Amplify application for the OQTOPUS frontend manually
(We know this is a bit clunky, but it will be fixed in a future version).
To do so, please refer to the official AWS documentations. The setup process is generally as simple as:

- Creating a new Amplify application
- Connecting the application to your repository (we recommend forking this repository)
- Configuring the environment variables as described below

Once these steps are complete, AWS Amplify will take care of the initial deployment of the OQTOPUS frontend.

### Environment Variables Settings

The OQTOPUS frontend works as a frontend for the OQTOPUS cloud, and it is built using the Vite.
This is because the several configurations are set via the `VITE_APP_`-prefixed environment variables.
Concretely, you must set the environment variables of the Amplify application as follows:

| entry                                   | description                                                                                                                                                                                          | example value                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `VITE_APP_API_ENDPOINT`                 | The base URL of the backend API. Basically, it will be the API endpoint of your API Gateway for the OQTOPUS User API.                                                                                | `https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/v1` |
| `VITE_APP_API_SIGNUP_ENDPOINT`          | The base URL of the authentication API. It will be the API endpoint of your API Gateway for the OQTOPUS UserSignUp API.                                                                              | `https://xxxxxxx.execute-api.us-east-1.amazonaws.com/v1`  |
| `VITE_APP_AUTH_COOKIE_STORAGE_DOMAIN`   | The cookie strage domain. Note that protocol (https) and trailing slash should not be included.                                                                                                      | `develop.xxxxxxxx.amplifyapp.com`                         |
| `VITE_APP_AUTH_REGION`                  | Your AWS region where the application is deployed                                                                                                                                                    | `us-east-1`                                               |
| `VITE_APP_AUTH_USER_POOL_ID`            | The Cognioto UserPool ID.                                                                                                                                                                            |                                                           |
| `VITE_APP_AUTH_USER_POOL_WEB_CLIENT_ID` | The Cognito UserPool Web client ID.                                                                                                                                                                  |                                                           |
| `VITE_APP_PUBLIC_BASE`                  | The absolute path to the directory containing the static assets. Intended for use during the local development, and in most cases, you need not set any value for the deployment to the AWS Amplify. | ""                                                        |

The application is built using Vite, so general knowledge about Vite environment variables applies.
For instance, you can use a .local environment file to override values listed in the .env file or to include sensitive values that should not be committed to version-controlled files.
For a more detailed explanation of how Vite handles and injects environment variables into the bundled application, please refer to [the official Vite documentation](https://ja.vite.dev/guide/env-and-mode.html).

## Development Guide

### Local development

You can start the local development server with the following steps:

```sh
bun install
bun run dev
```

### How to Update the `src/api`

The OQTOPUS Frontend uses machine-generated client code to communicate with the OQTOPUS backend API. This client code is located in the `src/api/generated` directory. To update the client code, you can use the `scripts/generate-openapi.ts` script as shown below:

```plain
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

  2) Use a local development server of OQTOPUS cloud running on the same host machine:
      generate-openapi --src http://localhost:8000 -p /oas/user/openapi.yaml

```

When running the generator manually, we recommend using it via the Bun script:

```sh
bun run generate --src github:...
```

*Note: Make sure Docker is running when using the generator, as it relies on running openapi-generator-cli via Docker.*

## Contact

You can contact us by creating an issue in this repository or by email:

- [oqtopus-team[at]googlegroups.com](mailto:oqtopus-team[at]googlegroups.com)

or you can join our Slack workspace:

[![slack](https://img.shields.io/badge/slack-OQTOPUS-pink.svg?logo=slack&style=plastic")](https://join.slack.com/t/oqtopus/shared_invite/zt-3bpjb7yc3-Vg8IYSMY1m5wV3DR~TMSnw)
