output "instance_public_ip" {
  value = module.k3s_server.public_ip
}

output "instance_id" {
  value = module.k3s_server.instance_id
}