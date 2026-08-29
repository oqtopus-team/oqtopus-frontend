/**
*
* # Frontend S3 Module
*
* ## Description
*
* This module creates an S3 bucket for the frontend application (e.g., Amplify hosting assets).
* It strictly blocks public access for security.
*
* ## Usage
*
* ```hcl
* module "s3" {
* source  = "./modules/s3"
* product = "oqtopus"
* org     = "example"
* env     = "dev"
* }
* ```
*
*/

resource "aws_s3_bucket" "this" {
  bucket        = "${var.product}-${var.org}-${var.env}"
  force_destroy = true
  tags = {
    Name = "${var.product}-${var.org}-${var.env}"
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
