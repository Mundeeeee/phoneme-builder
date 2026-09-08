#!/bin/bash
yum update -y
yum install -y docker
service docker start
usermod -a -G docker ec2-user

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 407963800242.dkr.ecr.us-east-1.amazonaws.com

mkdir -p /home/ec2-user/phoneme-db

docker run -d -p 3000:3000 --name phoneme-builder \
  --restart unless-stopped \
  -v /home/ec2-user/phoneme-db:/app/data \
  407963800242.dkr.ecr.us-east-1.amazonaws.com/phoneme-builder:latest
