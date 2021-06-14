
# IaC Pipeline Base

Boilerplate for an [IaC Pipeline](https://searchitoperations.techtarget.com/tip/Building-an-infrastructure-as-code-pipeline-in-the-cloud) using [CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) and [CDK Pipelines](https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/).


## Prerequisites

* a development machine with [Yarn](https://yarnpkg.com/getting-started/install) and [CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)
* [IAM admin](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html) with [programmatic access](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)
* if going to use CodeCommit, relevant IAM users should have [credentials set up](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_ssh-keys.html)
* if going to use GitHub, [access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) needs to be in [Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/tutorials_basic.html)
## Initial Deployment

* Configure `cdk.context.yaml`. See [Schema](#schema) below.
* Install the dependencies:
```bash
yarn install
npx yaml2json cdk.context.yaml > cdk.context.json
```
* Test that the configuration and code synthesizes properly:
```bash
cdk synth
```
* [Bootstrap CDK](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html) in the AWS account and region to be used:
```bash
cdk bootstrap \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  aws://<account>/<region>
```
* Deploy this pipeline:
```bash
cdk deploy
```
* If CodeCommit is created for this IaC code, [connect the local to the remote repo](https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-connect.html#how-to-connect-local).

## Schema

#### archi

| Field | Type | Description |
| :- | :- | :- |
| `id` | `string` | **Required**. ID for this pipeline |
| `pipeline` | **_`pipeline`_** | **Required**. pipeline definition |

#### pipeline

| Field | Type | Description |
| :- | :- | :- |
| `repo` | **_`repo`_** | **Required**. source stage definition |
| `build` | **_`build`_** | build stage definition |
| `validate` | **_`validate`_** | validate stage definition |

#### repo (CodeCommit)

| Field | Type | Description |
| :- | :- | :- |
| `type` | _`CodeCommit`_ | **Required**. literal if CodeCommit |
| `name` | `string` | **Required**. name of the repo |
| `create` | `boolean` | whether to create or pre-existing |

#### repo (GitHub)

| Field | Type | Description |
| :- | :- | :- |
| `type` | _`GitHub`_ | **Required**. literal if GitHub |
| `name` | `string` | **Required**. GitHub repo name |
| `tokenName` | `string` | **Required**. Secrets Manager token name |
| `owner` | `string` | **Required**. GitHub account name |

#### build

| Field | Type | Description |
| :- | :- | :- |
| `compute` | _`Small / Medium / Large / 2xLarge`_ | build container compute size |

#### validate

| Field | Type | Description |
| :- | :- | :- |
| `compute` | _`Small / Medium / Large / 2xLarge`_ | validate container compute size |
| `emails` | `array of strings` | email addresses to send notification |
