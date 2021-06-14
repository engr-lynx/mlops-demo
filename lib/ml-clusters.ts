import { Construct } from '@aws-cdk/core';
import { ClustersConf } from './context-helper';
import { NetworkStack } from './network-stack';
import { ContClusterStack } from './cont-cluster-stack';
import { K8ClusterStack } from './k8-cluster-stack';

export interface MlClustersProps extends ClustersConf {
  prefix?: string,
  network: NetworkStack,
}

export function buildMlClusters (scope: Construct, mlClustersProps: MlClustersProps) {
  const prefix = mlClustersProps.prefix??'';
  let contCluster;
  if (mlClustersProps.ecsFargate) {
    const contClusterId = prefix + 'ContCluster';
    contCluster = new ContClusterStack(scope, contClusterId, {
      ...mlClustersProps.ecsFargate,
      vpc: mlClustersProps.network.vpc,
    });
  };
  let k8Cluster;
  if (mlClustersProps.eksEc2) {
    const k8ClusterId = prefix + 'K8Cluster';
    k8Cluster = new K8ClusterStack(scope, k8ClusterId, {
      ...mlClustersProps.eksEc2,
      vpc: mlClustersProps.network.vpc,
    });
  };
  return {
    contCluster,
    k8Cluster
  };
}
