/**
*
* # Amplify Module
*
* ## Description
*
* This module creates an AWS Amplify application for the frontend.
*
*/

resource "aws_amplify_app" "this" {
  name = "${var.product}-${var.org}-${var.env}"

  iam_service_role_arn = var.iam_service_role_arn

}
