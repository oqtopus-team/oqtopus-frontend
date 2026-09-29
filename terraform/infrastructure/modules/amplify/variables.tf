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

variable "iam_service_role_arn" {
  description = "The ARN of the IAM role for Amplify to assume"
  type        = string
}
