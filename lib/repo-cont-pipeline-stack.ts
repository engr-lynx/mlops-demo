import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { ManualApprovalAction, CodeBuildActionType } from '@aws-cdk/aws-codepipeline-actions';
import { buildRepoSourceAction } from './pipeline-helper';
import { PipelineConf } from './context-helper';
import { ContStack } from './cont-stack';
import { buildContBuildAction, buildCustomAction } from './pipeline-helper'

export interface RepoContPipelineProps extends StackProps, PipelineConf {
  cont: ContStack,
  cacheBucket: Bucket,
}

export class RepoContPipelineStack extends Stack {

  constructor(scope: Construct, id: string, repoContPipelineProps: RepoContPipelineProps) {
    super(scope, id, repoContPipelineProps);
    const pipelineStages = [];
    const { action: repoSource, sourceCode } = buildRepoSourceAction(this, {
      ...repoContPipelineProps.repo,
    });
    const sourceStage = {
      stageName: 'Source',
      actions: [
        repoSource,
      ],
    };
    pipelineStages.push(sourceStage);
    const { action: contBuild, contRepo } = buildContBuildAction(this, {
      ...repoContPipelineProps.build,
      sourceCode,
    });
    const buildStage = {
      stageName: 'Build',
      actions: [
        contBuild,
      ],
    };
    /* Todo:
     * optional stages (in order from build) - staging (register-task-definition), deploy, staging cleanup (stop task)
     */
    pipelineStages.push(buildStage);
    if (repoContPipelineProps.test) {
      const prefix = id + 'Test';
      const { action: testAction, artifact: testArtifact } = buildCustomAction(this, {
        ...repoContPipelineProps.test,
        prefix,
        type: CodeBuildActionType.TEST,
        input: sourceCode,
        cacheBucket: repoContPipelineProps.cacheBucket,
      });
      const testStage = {
        stageName: 'Test',
        actions: [
          testAction,
        ],
      };
      pipelineStages.push(testStage);
    };
    if (repoContPipelineProps.validate) {
      const approvalAction = new ManualApprovalAction({
        actionName: 'Approval',
        notifyEmails: repoContPipelineProps.validate.emails,
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
    //     repoContPipelineProps.func.functionArn,
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
    //   funcName: repoContPipelineProps.func.functionName,
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
    new Pipeline(this, 'RepoContPipeline', {
      stages: pipelineStages,
      restartExecutionOnUpdate: false,
    });
  }

}
