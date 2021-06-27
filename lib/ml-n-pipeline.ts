import { Construct } from '@aws-cdk/core';
import { ContStack } from './cont-stack';
import { RepoContPipelineStack } from './repo-cont-pipeline-stack';
import { RepoK8PipelineStack } from './repo-k8-pipeline-stack';
import { CustomContConf, CustomK8Conf } from './context-helper';
import { ContClusterStack } from './cont-cluster-stack';
import { K8ClusterStack } from './k8-cluster-stack';

interface BaseMlNPipelineProps {
  prefix?: string,
}

export interface ContNPipelineProps extends BaseMlNPipelineProps, CustomContConf {
  contCluster: ContClusterStack,
  cacheBucketArn: string,
}

export function buildContNPipeline (scope: Construct, contNPipelineProps: ContNPipelineProps) {
  const prefix = contNPipelineProps.prefix??'';
  const contId = prefix + 'Ml';
  const cont = new ContStack(scope, contId, {
    ...contNPipelineProps,
    namespace: contNPipelineProps.contCluster.namespace,
    cluster: contNPipelineProps.contCluster.cluster,
  });
  const contPipelineId = prefix + 'MlPipeline';
  new RepoContPipelineStack(scope, contPipelineId, {
    ...contNPipelineProps.pipeline,
    cont,
    cacheBucketArn: contNPipelineProps.cacheBucketArn,
  });
}

export interface K8NPipelineProps extends BaseMlNPipelineProps, CustomK8Conf {
  k8Cluster: K8ClusterStack,
}

export function buildK8NPipeline (scope: Construct, k8NPipelineProps: K8NPipelineProps) {
  const prefix = k8NPipelineProps.prefix??'';
  const k8PipelineId = prefix + 'MlPipeline';
  new RepoK8PipelineStack(scope, k8PipelineId, {
    ...k8NPipelineProps.pipeline,
  });
}
