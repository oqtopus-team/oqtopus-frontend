variable "product" {
  description = "product name"
  type        = string
}

variable "org" {
  description = "organization name"
  type        = string
}

variable "env" {
  description = "environment name"
  type        = string
}

variable "s3_bucket_arn" {
  description = "The ARN of the frontend S3 bucket"
  type        = string
}
