import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Vpc } from '@aws-cdk/aws-ec2';
import { Cluster } from '@aws-cdk/aws-ecs';
import { PrivateDnsNamespace } from '@aws-cdk/aws-servicediscovery';
import { EcsFargateConf } from './context-helper';

export interface ContClusterProps extends StackProps, EcsFargateConf {
  vpc: Vpc,
}

export class ContClusterStack extends Stack {

  public readonly cluster: Cluster;
  public readonly namespace: PrivateDnsNamespace;

  constructor(scope: Construct, id: string, contClusterProps: ContClusterProps) {
    super(scope, id, contClusterProps);
    const vpc = contClusterProps.vpc;
    this.cluster = new Cluster(this, 'ContCluster', {
      vpc,
    });
    this.namespace = new PrivateDnsNamespace(this, 'ContNamespace', {
      name: contClusterProps.namespace,
      vpc,
    });
  }

}
