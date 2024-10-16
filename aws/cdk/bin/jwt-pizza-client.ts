#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { JwtPizzaClientStack } from '../lib/jwt-pizza-client-stack';

const app = new cdk.App();
new JwtPizzaClientStack(app, 'JwtPizzaClientStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
});