
module "s3" {
  source  = "../modules/s3"
  product = var.product
  org     = var.org
  env     = var.env
}

module "iam" {
  source  = "../modules/iam"
  product = var.product
  org     = var.org
  env     = var.env

  s3_bucket_arn = module.s3.s3_bucket_arn
}

module "amplify" {
  source  = "../modules/amplify"
  product = var.product
  org     = var.org
  env     = var.env

  iam_service_role_arn = module.iam.amplify_role_arn
}
