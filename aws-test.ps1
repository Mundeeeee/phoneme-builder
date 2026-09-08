# test-aws-academy.ps1
#
# Staged verification that your AWS Academy Learner Lab credentials and
# the LabInstanceProfile role actually support the ECR + EC2 deployment
# path — using throwaway test resources, before touching your real app
# image. Run this in VS Code's integrated PowerShell terminal.
#
# Assumes: AWS CLI installed and configured (aws configure / pasted
# Learner Lab credentials), Docker Desktop running, and that you've
# downloaded labsuser.pem from the Academy "AWS Details" panel into
# this same folder if you want to do the SSH step in Test 3.

$Region = "us-east-1"

Write-Host "=== Test 1: Credentials + region access ===" -ForegroundColor Cyan
aws sts get-caller-identity
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED - is your Learner Lab session started? Check the Academy portal." -ForegroundColor Red
    exit 1
}

$AccountId = (aws sts get-caller-identity --query Account --output text).Trim()
Write-Host "Account ID: $AccountId"

aws ec2 describe-availability-zones --region $Region | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED - region access issue (Academy labs are restricted to us-east-1/us-west-2 only)." -ForegroundColor Red
    exit 1
}
Write-Host "Test 1 passed." -ForegroundColor Green
Read-Host "Press Enter to continue to Test 2 (ECR push of a tiny throwaway image)"

Write-Host "=== Test 2: ECR create + push (test-repo) ===" -ForegroundColor Cyan
aws ecr create-repository --repository-name test-repo --region $Region
docker pull hello-world
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"
docker tag hello-world:latest "$AccountId.dkr.ecr.$Region.amazonaws.com/test-repo:latest"
docker push "$AccountId.dkr.ecr.$Region.amazonaws.com/test-repo:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED at ECR push - check the error above." -ForegroundColor Red
    exit 1
}
Write-Host "Test 2 passed." -ForegroundColor Green
Read-Host "Press Enter to continue to Test 3 (launches a real, billable-but-tiny EC2 instance)"

Write-Host "=== Test 3: EC2 launch + LabInstanceProfile ECR pull ===" -ForegroundColor Cyan
$AmiId = (aws ec2 describe-images --owners amazon `
  --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" "Name=state,Values=available" `
  --query "sort_by(Images, &CreationDate)[-1].ImageId" `
  --output text --region $Region).Trim()
Write-Host "Using AMI: $AmiId"

aws ec2 create-security-group --group-name test-sg --description "test" --region $Region 2>$null
aws ec2 authorize-security-group-ingress --group-name test-sg --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $Region 2>$null

$InstanceId = (aws ec2 run-instances `
  --image-id $AmiId `
  --instance-type t2.micro `
  --iam-instance-profile Name=LabInstanceProfile `
  --key-name vockey `
  --security-groups test-sg `
  --region $Region `
  --query "Instances[0].InstanceId" --output text).Trim()

Write-Host "Launched instance: $InstanceId - waiting for it to reach 'running'..."
aws ec2 wait instance-running --instance-ids $InstanceId --region $Region

$PublicIp = (aws ec2 describe-instances --instance-ids $InstanceId `
  --query "Reservations[0].Instances[0].PublicIpAddress" `
  --output text --region $Region).Trim()
Write-Host "Public IP: $PublicIp"

Write-Host ""
Write-Host "Now SSH in to test the pull manually:" -ForegroundColor Yellow
Write-Host "  ssh -i labsuser.pem ec2-user@$PublicIp"
Write-Host "Once connected, run:"
Write-Host "  sudo yum install -y docker && sudo service docker start"
Write-Host "  aws ecr get-login-password --region $Region | sudo docker login --username AWS --password-stdin $AccountId.dkr.ecr.$Region.amazonaws.com"
Write-Host "  sudo docker pull $AccountId.dkr.ecr.$Region.amazonaws.com/test-repo:latest"
Write-Host ""
Write-Host "If that pull succeeds WITHOUT you running 'aws configure' on the instance," -ForegroundColor Yellow
Write-Host "it proves LabInstanceProfile alone grants ECR pull access - the exact thing" -ForegroundColor Yellow
Write-Host "your real deployment depends on." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter once you've verified the pull worked (or given up), to clean up"

Write-Host "=== Cleanup ===" -ForegroundColor Cyan
aws ec2 terminate-instances --instance-ids $InstanceId --region $Region
aws ecr delete-repository --repository-name test-repo --region $Region --force
Write-Host "Done. If all three tests passed, you're clear to deploy the real app image the same way." -ForegroundColor Green