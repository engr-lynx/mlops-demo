import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { ManualApprovalAction, CodeBuildActionType } from '@aws-cdk/aws-codepipeline-actions';
import { buildRepoSourceAction } from './pipeline-helper';
import { PipelineConf } from './context-helper';
import { buildContBuildAction, buildCustomAction } from './pipeline-helper'

export interface RepoK8PipelineProps extends StackProps, PipelineConf {
  cacheBucketArn?: string,
}

export class RepoK8PipelineStack extends Stack {

  constructor(scope: Construct, id: string, repoK8PipelineProps: RepoK8PipelineProps) {
    super(scope, id, repoK8PipelineProps);
    let cacheBucket;
    if (repoK8PipelineProps.cacheBucketArn) {
      cacheBucket = Bucket.fromBucketArn(this, 'CacheBucket', repoK8PipelineProps.cacheBucketArn);
    } else {
      cacheBucket = new Bucket(this, 'CacheBucket');
    };
    const pipelineStages = [];
    const { action: repoSource, sourceCode } = buildRepoSourceAction(this, {
      ...repoK8PipelineProps.repo,
    });
    const sourceStage = {
      stageName: 'Source',
      actions: [
        repoSource,
      ],
    };
    pipelineStages.push(sourceStage);
    const { action: contBuild, contRepo } = buildContBuildAction(this, {
      ...repoK8PipelineProps.build,
      sourceCode,
    });
    const buildStage = {
      stageName: 'Build',
      actions: [
        contBuild,
      ],
    };
    /* Todo:
     * optional stages (in order from build) - staging, deploy, staging cleanup
     */
    pipelineStages.push(buildStage);
    if (repoK8PipelineProps.test) {
      const prefix = id + 'Test';
      const { action: testAction, artifact: testArtifact } = buildCustomAction(this, {
        ...repoK8PipelineProps.test,
        prefix,
        type: CodeBuildActionType.TEST,
        input: sourceCode,
        cacheBucket,
      });
      const testStage = {
        stageName: 'Test',
        actions: [
          testAction,
        ],
      };
      pipelineStages.push(testStage);
    };
    if (repoK8PipelineProps.validate) {
      const approvalAction = new ManualApprovalAction({
        actionName: 'Approval',
        notifyEmails: repoK8PipelineProps.validate.emails,
      });
      const validateStage = {
        stageName: 'Validate',
        actions: [
          approvalAction,
        ],
      };
      pipelineStages.push(validateStage);
    };
    // const deployPolicy = new PolicyStatement({
    //   effect: Effect.ALLOW,
    //   actions: [
    //     'lambda:UpdateFunctionCode',
    //   ],
    //   resources: [
    //     repoK8PipelineProps.func.functionArn,
    //   ],
    // });
    // const deployCode = Code.fromAsset(join(__dirname, 'sls-cont-deploy-handler'));
    // const deployHandler = new Function(this, 'DeployHandler', {
    //   runtime: Runtime.PYTHON_3_8,
    //   handler: 'slsdeploy.on_event',
    //   code: deployCode,
    //   timeout: Duration.minutes(1),
    //   logRetention: RetentionDays.ONE_DAY,
    //   initialPolicy: [
    //     deployPolicy,
    //   ],
    // });
    // contRepo.grant(deployHandler,
    //   'ecr:SetRepositoryPolicy',
    //   'ecr:GetRepositoryPolicy',
    //   'ecr:InitiateLayerUpload'
    // );
    // const userParameters = {
    //   funcName: repoK8PipelineProps.func.functionName,
    //   repoUri: contRepo.repositoryUri + ':latest',
    // };
    // const slsDeploy = new LambdaInvokeAction({
    //   actionName: 'SlsDeploy',
    //   lambda: deployHandler,
    //   userParameters: deployProps,
    // });
    // const deployStage = {
    //   stageName: 'Deploy',
    //   actions: [
    //     slsDeploy,
    //   ],
    // };
    // pipelineStages.push(deployStage);
    new Pipeline(this, 'RepoK8Pipeline', {
      stages: pipelineStages,
      restartExecutionOnUpdate: false,
    });
  }

}
