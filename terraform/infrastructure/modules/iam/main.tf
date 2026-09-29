/**
*
* # Frontend IAM Module
*
* ## Description
*
* This module creates an IAM role for the Amplify frontend application
* to access the S3 bucket for build artifacts and assets.
*
*/

resource "aws_iam_role" "this" {
  name = "${var.product}-${var.org}-${var.env}-build-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "s3_access" {
  name = "${var.product}-${var.org}-${var.env}-amplify-s3-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "this" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.s3_access.arn
}
