# deploy-to-aws.ps1
#
# Deploys the REAL phoneme-builder app to AWS Academy Learner Lab, using
# the exact ECR + EC2 + LabInstanceProfile pattern already proven by
# test-aws-academy.ps1. Run this from your project folder in VS Code's
# integrated PowerShell terminal.

$Region = "us-east-1"
$RepoName = "phoneme-builder"

# ---------- 1. Confirm session + get account ID ----------
Write-Host "=== Checking AWS Academy session ===" -ForegroundColor Cyan
aws sts get-caller-identity
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED - start your Learner Lab session first." -ForegroundColor Red
    exit 1
}
$AccountId = (aws sts get-caller-identity --query Account --output text).Trim()
$RepoUri = "$AccountId.dkr.ecr.$Region.amazonaws.com/$RepoName"
Write-Host "Account: $AccountId"
Write-Host "Target image: ${RepoUri}:latest"

# ---------- 2. Create ECR repo (safe to re-run - ignores "already exists") ----------
Write-Host "=== Creating ECR repository (if it doesn't already exist) ===" -ForegroundColor Cyan
aws ecr create-repository --repository-name $RepoName --region $Region 2>$null

# ---------- 3. Build the real image ----------
Write-Host "=== Building phoneme-builder image ===" -ForegroundColor Cyan
docker build -t $RepoName . --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED - fix the build error above before continuing." -ForegroundColor Red
    exit 1
}

# ---------- 4. Tag and push to ECR ----------
Write-Host "=== Pushing to ECR ===" -ForegroundColor Cyan
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"
docker tag "${RepoName}:latest" "${RepoUri}:latest"
docker push "${RepoUri}:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED at push - check the error above." -ForegroundColor Red
    exit 1
}
Write-Host "Image pushed successfully." -ForegroundColor Green

# ---------- 5. Security group allowing the app (3000) + SSH (22) ----------
Write-Host "=== Setting up security group ===" -ForegroundColor Cyan
aws ec2 create-security-group --group-name phoneme-builder-sg --description "phoneme-builder app + SSH" --region $Region 2>$null
aws ec2 authorize-security-group-ingress --group-name phoneme-builder-sg --protocol tcp --port 3000 --cidr 0.0.0.0/0 --region $Region 2>$null
aws ec2 authorize-security-group-ingress --group-name phoneme-builder-sg --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $Region 2>$null

# ---------- 6. Write the EC2 user-data script (installs Docker, runs the container) ----------
Write-Host "=== Preparing EC2 startup script ===" -ForegroundColor Cyan
$UserData = @"
#!/bin/bash
yum update -y
yum install -y docker
service docker start
usermod -a -G docker ec2-user

aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $AccountId.dkr.ecr.$Region.amazonaws.com

mkdir -p /home/ec2-user/phoneme-db

docker run -d -p 3000:3000 --name phoneme-builder \
  --restart unless-stopped \
  -v /home/ec2-user/phoneme-db:/app/data \
  $RepoUri`:latest
"@
$UserData | Out-File -Encoding ascii -FilePath ec2-userdata.sh

# ---------- 7. Launch the EC2 instance ----------
Write-Host "=== Launching EC2 instance ===" -ForegroundColor Cyan
$AmiId = (aws ec2 describe-images --owners amazon `
  --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" "Name=state,Values=available" `
  --query "sort_by(Images, &CreationDate)[-1].ImageId" `
  --output text --region $Region).Trim()
Write-Host "Using AMI: $AmiId"

$InstanceId = (aws ec2 run-instances `
  --image-id $AmiId `
  --instance-type t2.micro `
  --iam-instance-profile Name=LabInstanceProfile `
  --key-name vockey `
  --security-groups phoneme-builder-sg `
  --user-data file://ec2-userdata.sh `
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=phoneme-builder}]' `
  --region $Region `
  --query "Instances[0].InstanceId" --output text).Trim()

Write-Host "Launched instance: $InstanceId - waiting for it to reach 'running'..."
aws ec2 wait instance-running --instance-ids $InstanceId --region $Region

$PublicIp = (aws ec2 describe-instances --instance-ids $InstanceId `
  --query "Reservations[0].Instances[0].PublicIpAddress" `
  --output text --region $Region).Trim()

Write-Host ""
Write-Host "=== Instance is up ===" -ForegroundColor Green
Write-Host "Public IP: $PublicIp"
Write-Host "Give it 1-2 minutes to finish pulling the image and starting the container, then check:"
Write-Host "  Invoke-RestMethod http://${PublicIp}:3000/health"
Write-Host "  (or open http://${PublicIp}:3000 in a browser)"
Write-Host ""
Write-Host "To view startup logs if something looks wrong:"
Write-Host "  ssh -i labsuser.pem ec2-user@$PublicIp"
Write-Host "  sudo docker logs phoneme-builder"
Write-Host ""
Write-Host "Instance ID (save this for teardown later): $InstanceId"
