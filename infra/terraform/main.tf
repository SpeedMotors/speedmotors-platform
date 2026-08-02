data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true

  owners = ["099720109477"]

  filter {
    name = "name"
    values = [
      "ubuntu/images/hvm-ssd-gp3/ubuntu-resolute-26.04-amd64-server-*"
    ]
  }
}

module "security_group" {
  source = "./modules/security-group"

  project_name = var.project_name
  environment  = var.environment

  vpc_id = data.aws_vpc.default.id

  ssh_allowed_cidr = ["0.0.0.0/0"]
}

module "k3s_server" {
  source = "./modules/ec2"

  ami_id            = data.aws_ami.ubuntu.id
  subnet_id         = data.aws_subnets.default.ids[0]
  instance_type     = var.instance_type
  key_name          = var.key_name
  security_group_id = module.security_group.security_group_id

  project_name = var.project_name
  environment  = var.environment
}