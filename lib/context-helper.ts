export interface Context {
  [key: string]: any,
}

export class ContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContextError';
  }
}

/**/

export enum RepoType {
  CodeCommit = 'CodeCommit',
  GitHub = 'GitHub',
}

interface BaseRepoConf {
  type: RepoType,
  name: string,
}

export interface CodeCommitConf extends BaseRepoConf {
  type: RepoType.CodeCommit,
  create?: boolean,
}

export interface GitHubConf extends BaseRepoConf {
  type: RepoType.GitHub,
  tokenName: string,
  owner: string,
}

export type RepoConf = CodeCommitConf | GitHubConf;

/**/

export enum ComputeSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  X2Large = '2xLarge',
}

interface RuntimeConf {
  [key: string]: any,
}

export interface StageConf {
  compute?: ComputeSize,
  runtimes?: RuntimeConf,
  specFilename?: string,
}

export interface BuildConf extends StageConf {
  privileged?: boolean,
  prebuildScript?: string,
  postbuildScript?: string,
}

interface StagingConf extends StageConf {}

interface TestConf extends StageConf {}

interface DeployConf extends StageConf {}

export interface ValidateConf extends StageConf {
  emails?: string[],
}

export interface PipelineConf {
  repo: RepoConf,
  build?: BuildConf,
  staging?: StagingConf,
  test?: TestConf,
  validate?: ValidateConf,
  deploy?: DeployConf,
}

interface DeployableConf {
  pipeline: PipelineConf,
}

export interface ArchiConf extends DeployableConf {
  id: string,
}

export interface NetworkConf {
  azCount?: number,
}

export interface EcsFargateConf {
  namespace: string,
}

export interface EksEc2Conf {
  k8Version: string,
  instanceType: string,
}

export interface ClustersConf {
  ecsFargate?: EcsFargateConf,
  eksEc2?: EksEc2Conf,
}

export enum MlType {
  Sagemaker = 'Sagemaker',
  CustomCont = 'CustomCont',
  CustomK8 = 'CustomK8',
} 

export interface CustomContConf extends DeployableConf {
  type: MlType.CustomCont,
}

export interface CustomK8Conf extends DeployableConf {
  type: MlType.CustomK8,
}

export interface SagemakerConf extends DeployableConf {
  type: MlType.Sagemaker,
}

export type MlConf = CustomContConf | CustomK8Conf | SagemakerConf;

export interface ServiceConf {
  id: string,
  ml: MlConf,
}

export interface ServicesConf {
  network?: NetworkConf,
  clusters?: ClustersConf,
  list: ServiceConf[],
}
