import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { NetworkStack } from './network-stack';
import { buildMlClusters } from './ml-clusters';
import { ServicesConf, MlType, ContextError } from './context-helper';
import { buildContNPipeline, buildK8NPipeline } from './ml-n-pipeline';

interface CloudDeployProps extends StageProps {
  cacheBucketArn?: string,
}

/**
 * Deployable unit of entire architecture
 */
export class CloudDeployStage extends Stage {

  constructor(scope: Construct, id: string, cloudDeployProps?: CloudDeployProps) {
    super(scope, id, cloudDeployProps);
    const servicesContext = this.node.tryGetContext('services');
    const servicesConf = servicesContext as ServicesConf;
    const serviceNetwork = new NetworkStack(this, 'ServiceNetwork', {
      ...servicesConf.network,
    });
    const { contCluster: serviceContCluster, k8Cluster: serviceK8Cluster } = buildMlClusters(this, {
      ...servicesConf.clusters,
      prefix: 'Service',
      network: serviceNetwork,
    });
    servicesConf.list.forEach(serviceConf => {
      const prefix = serviceConf.id;
      const mlConf = serviceConf.ml;
      switch (mlConf.type) {
        case MlType.CustomCont:
          if (!serviceContCluster) {
            throw new ContextError('No provisioned ECS cluster.');
          };
          buildContNPipeline(this, {
            ...mlConf,
            prefix,
            contCluster: serviceContCluster,
            cacheBucketArn: cloudDeployProps?.cacheBucketArn,
          });
          break;
        case MlType.CustomK8:
          if (!serviceK8Cluster) {
            throw new ContextError('No provisioned EKS cluster.');
          };
          buildK8NPipeline(this, {
            ...mlConf,
            prefix,
            k8Cluster: serviceK8Cluster,
            cacheBucketArn: cloudDeployProps?.cacheBucketArn,
          });
          break;
        default:
          throw new Error('Unsupported Type');
      };
    });  }

}
