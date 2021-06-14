import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Cluster, FargateService, FargateTaskDefinition, ContainerImage } from '@aws-cdk/aws-ecs';
import { PrivateDnsNamespace } from '@aws-cdk/aws-servicediscovery';
import { CustomContConf } from './context-helper';

export interface ContProps extends StackProps, CustomContConf {
  namespace: PrivateDnsNamespace,
  cluster: Cluster,
}

export class ContStack extends Stack {

  public readonly task: FargateTaskDefinition;

  constructor(scope: Construct, id: string, contProps: ContProps) {
    super(scope, id, contProps);
    const taskDefinition = new FargateTaskDefinition(this, 'TaskDefinition');
    const contImage = ContainerImage.fromRegistry('daemonza/testapi');
    taskDefinition.addContainer('Cont', {
      image: contImage,
    });
    this.task = taskDefinition;
    const cloudMapOptions = {
      cloudMapNamespace: contProps.namespace,
    };
    new FargateService(this, 'Service', {
      cluster: contProps.cluster,
      taskDefinition,
      cloudMapOptions,
    });
  }

}
