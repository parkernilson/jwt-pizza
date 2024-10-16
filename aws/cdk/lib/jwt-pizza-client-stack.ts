import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class JwtPizzaClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubUsername = 'parkernilson'
    const githubRepoName = 'jwt-pizza'

    const domainName = 'parkernilson.dev';
    const siteDomain = `pizza.${domainName}`;
    
    const accountId = cdk.Stack.of(this).account

    // Create an S3 bucket to store the React app
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: siteDomain,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Create a CloudFront origin access identity
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');
    siteBucket.grantRead(originAccessIdentity);

    // TLS certificate
    const certificate = new acm.Certificate(this, 'SiteCertificate', {
      domainName: siteDomain,
      validation: acm.CertificateValidation.fromDns()
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      certificate: certificate,
      defaultRootObject: "index.html",
      domainNames: [siteDomain],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(siteBucket, {originAccessIdentity}),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    });

    // Create an IAM role for GitHub Actions
    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      assumedBy: new iam.WebIdentityPrincipal(`arn:aws:iam::${accountId}:oidc-provider/token.actions.githubusercontent.com`, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${githubUsername}/${githubRepoName}:ref:refs/heads/main`
        },
      }),
      description: 'Role for GitHub Actions to deploy to S3 and invalidate CloudFront',
    });

    // Grant the role permissions to write to S3 and invalidate CloudFront
    siteBucket.grantReadWrite(githubActionsRole);
    distribution.grantCreateInvalidation(githubActionsRole);

    // Output the necessary information
    new cdk.CfnOutput(this, 'BucketName', { value: siteBucket.bucketName });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'GithubActionsRoleArn', { value: githubActionsRole.roleArn });
  }
}
