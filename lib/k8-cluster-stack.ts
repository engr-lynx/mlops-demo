import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Vpc, InstanceType } from '@aws-cdk/aws-ec2';
import { Cluster, KubernetesVersion, CoreDnsComputeType } from '@aws-cdk/aws-eks';
import { EksEc2Conf } from './context-helper';

export interface K8ClusterProps extends StackProps, EksEc2Conf {
  vpc: Vpc,
}

export class K8ClusterStack extends Stack {

  public readonly cluster: Cluster;

  constructor(scope: Construct, id: string, k8ClusterProps: K8ClusterProps) {
    super(scope, id, k8ClusterProps);
    const version = KubernetesVersion.of(k8ClusterProps.k8Version);
    this.cluster = new Cluster(this, 'Cluster', {
      version,
      defaultCapacity: 0,
      coreDnsComputeType: CoreDnsComputeType.FARGATE,
      vpc: k8ClusterProps.vpc,
    });
    const instanceType = new InstanceType(k8ClusterProps.instanceType);
    this.cluster.addAutoScalingGroupCapacity('AutoScalingGroup', {
      instanceType,
    });
  }

}
