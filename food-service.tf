variable "region" {
  type = string
}

variable "profile" {
  type = string
}

locals {
  project = "hnh-food"
}

provider "aws" {
  profile = var.profile
  region = var.region
}

provider "archive" {}

resource "aws_s3_bucket" "main" {
  bucket = local.project
  acl = "public-read"
  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${local.project}/*"
        }
    ]
}
POLICY

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  tags = {
    Name = "project"
    Environment = local.project
  }
}


resource "aws_dynamodb_table" "main" {
  name = local.project
  billing_mode = "PROVISIONED"
  read_capacity = 25
  write_capacity = 25
  hash_key = "hash"
  stream_enabled = true
  stream_view_type = "NEW_IMAGE"

  attribute {
    name = "hash"
    type = "S"
  }

  tags = {
    Name = "project"
    Environment = local.project
  }
}

data "aws_iam_policy_document" "assume_policy" {
  statement {
    sid = ""
    effect = "Allow"

    principals {
      identifiers = [
        "lambda.amazonaws.com"]
      type = "Service"
    }

    actions = [
      "sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "policy" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:BatchWriteItem",
      "dynamodb:GetRecords",
      "dynamodb:GetShardIterator",
      "dynamodb:DescribeStream",
      "dynamodb:ListStreams"
    ]

    resources = [
      aws_dynamodb_table.main.arn,
      "${aws_dynamodb_table.main.arn}/*",
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject"]

    resources = [
      "${aws_s3_bucket.main.arn}/*"
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"]

    resources = [
      "arn:aws:logs:*:*:*"
    ]
  }
}

resource "aws_iam_policy" "lambda_access" {
  name = "lambda_access_policy"
  policy = data.aws_iam_policy_document.policy.json
}

resource "aws_iam_policy_attachment" "lambda_access" {
  name = "lambda_access_policy_attch"
  roles = [
    aws_iam_role.iam_for_lambda.name]
  policy_arn = aws_iam_policy.lambda_access.arn
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_policy.json

  tags = {
    Name = "project"
    Environment = local.project
  }
}

data "archive_file" "lambda_stream_processor_src" {
  type = "zip"
  source_file = "lambdas/dist/processDynamoDBStream/handler.js"
  output_path = "deploy/lambda_stream_processor_src.zip"
}

resource "aws_lambda_function" "stream_processor" {
  function_name = "processDynamoDBStream"
  role = aws_iam_role.iam_for_lambda.arn
  handler = "handler.handler"
  filename = data.archive_file.lambda_stream_processor_src.output_path
  source_code_hash = data.archive_file.lambda_stream_processor_src.output_base64sha256
  runtime = "nodejs12.x"

  environment {
    variables = {
      S3_BUCKET_NAME = aws_s3_bucket.main.bucket
    }
  }

  tags = {
    Name = "project"
    Environment = local.project
  }
}

data "archive_file" "lambda_data_receiver_src" {
  type = "zip"
  source_file = "lambdas/dist/receiveFoodData/handler.js"
  output_path = "deploy/lambda_data_receiver_src.zip"
}

resource "aws_lambda_function" "data_receiver" {
  function_name = "receiveFoodData"
  role = aws_iam_role.iam_for_lambda.arn
  handler = "handler.handler"
  filename = data.archive_file.lambda_data_receiver_src.output_path
  source_code_hash = data.archive_file.lambda_data_receiver_src.output_base64sha256
  runtime = "nodejs12.x"

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.main.name
    }
  }

  tags = {
    Name = "project"
    Environment = local.project
  }
}

resource "aws_lambda_event_source_mapping" "ddb_stream" {
  event_source_arn = aws_dynamodb_table.main.stream_arn
  function_name = aws_lambda_function.stream_processor.arn
  batch_size = 500
  maximum_batching_window_in_seconds = 60
  starting_position = "LATEST"
}

resource "aws_api_gateway_rest_api" "api" {
  name = local.project
  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "project"
    Environment = local.project
  }
}

resource "aws_api_gateway_resource" "food" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_rest_api.api.root_resource_id
  path_part = "food"
}

resource "aws_lambda_permission" "data_receiver" {
  statement_id = "AllowAPIGatewayInvoke"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.data_receiver.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_api_gateway_model" "empty_model" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  name = "EmptyModel"
  content_type = "application/json"

  schema = <<EOF
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title" : "Empty Schema",
  "type" : "object"
}
EOF
}

resource "aws_api_gateway_model" "food_list_model" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  name = "FoodListModel"
  content_type = "application/json"

  schema = <<EOF
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "itemName",
      "resourceName",
      "feps"
    ],
    "properties": {
      "itemName": {
        "type": "string"
      },
      "energy": {
        "type": "integer"
      },
      "hunger": {
        "type": "number"
      },
      "ingredients": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "percentage",
            "name"
          ],
          "properties": {
            "percentage": {
              "type": "integer"
            },
            "name": {
              "type": "string"
            }
          }
        }
      },
      "resourceName": {
        "type": "string"
      },
      "feps": {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "name",
            "value"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "value": {
              "type": "number"
            }
          }
        }
      }
    }
  }
}
EOF
}

resource "aws_api_gateway_request_validator" "validator" {
  name = "food-validator"
  rest_api_id = aws_api_gateway_rest_api.api.id
  validate_request_body = true
  validate_request_parameters = false
}

resource "aws_api_gateway_method" "food_post" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.food.id
  http_method = "POST"
  authorization = "NONE"
  request_validator_id = aws_api_gateway_request_validator.validator.id

  request_models = {
    "application/json" = aws_api_gateway_model.food_list_model.name
  }
}

resource "aws_api_gateway_integration" "food_post_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_method.food_post.resource_id
  http_method = aws_api_gateway_method.food_post.http_method
  integration_http_method = "POST"
  type = "AWS"
  uri = aws_lambda_function.data_receiver.invoke_arn
  passthrough_behavior = "WHEN_NO_MATCH"
}

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.food.id
  http_method = aws_api_gateway_method.food_post.http_method
  status_code = "200"
  response_models = {
    "application/json" = aws_api_gateway_model.empty_model.name
  }
}

resource "aws_api_gateway_integration_response" "data_receiver" {
  depends_on = [
    aws_api_gateway_integration.food_post_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.food.id
  http_method = aws_api_gateway_method.food_post.http_method
  status_code = aws_api_gateway_method_response.response_200.status_code

  response_templates = {
    "application/json" = ""
  }
}

resource "aws_api_gateway_deployment" "prod" {
  depends_on = [
    aws_api_gateway_integration.food_post_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name = "prod"
}

output "base_url" {
  value = aws_api_gateway_deployment.prod.invoke_url
}