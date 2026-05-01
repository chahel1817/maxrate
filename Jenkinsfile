pipeline {
    agent any

    environment {
        EC2_HOST = 'ec2-3-109-47-239.ap-south-1.compute.amazonaws.com'
        EC2_USER = 'ubuntu'
        APP_JAR = 'target/maxrate-0.0.1-SNAPSHOT.jar'
        DEPLOY_PATH = '/home/ubuntu/app.jar'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Test') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'chmod +x ./mvnw'
                        sh './mvnw clean package'
                    } else {
                        bat 'mvnw.cmd clean package'
                    }
                }
            }
        }

        stage('Archive Artifact') {
            steps {
                archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'aws-ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER'),
                    string(credentialsId: 'maxrate-jdbc-url', variable: 'JDBC_URL'),
                    string(credentialsId: 'maxrate-db-user', variable: 'DB_USER'),
                    string(credentialsId: 'maxrate-db-pass', variable: 'DB_PASS')
                ]) {
                    script {
                        if (isUnix()) {
                            sh '''
                                set -e
                                cat > maxrate.env <<EOF
JDBC_URL=$JDBC_URL
DB_USER=$DB_USER
DB_PASS=$DB_PASS
PORT=8080
EOF
                                cat > maxrate.service <<EOF
[Unit]
Description=MaxRate Spring Boot API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu
EnvironmentFile=/etc/maxrate.env
ExecStart=/usr/bin/java -jar /home/ubuntu/app.jar
Restart=always
RestartSec=10
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
EOF
                                scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$APP_JAR" "$SSH_USER@$EC2_HOST:$DEPLOY_PATH"
                                scp -i "$SSH_KEY" -o StrictHostKeyChecking=no maxrate.env "$SSH_USER@$EC2_HOST:/home/ubuntu/maxrate.env"
                                scp -i "$SSH_KEY" -o StrictHostKeyChecking=no maxrate.service "$SSH_USER@$EC2_HOST:/home/ubuntu/maxrate.service"
                                ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_HOST" "sudo mv /home/ubuntu/maxrate.env /etc/maxrate.env && sudo chown root:root /etc/maxrate.env && sudo chmod 600 /etc/maxrate.env && sudo mv /home/ubuntu/maxrate.service /etc/systemd/system/maxrate.service && sudo systemctl daemon-reload && sudo systemctl enable maxrate && sudo systemctl restart maxrate && sleep 8 && if sudo systemctl is-active --quiet maxrate; then echo 'maxrate service is running'; else sudo journalctl -u maxrate -n 80 --no-pager; exit 1; fi"
                            '''
                        } else {
                            powershell '''
                                $ErrorActionPreference = "Stop"

                                $key = $env:SSH_KEY
                                $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
                                $acl = Get-Acl -LiteralPath $key
                                $acl.SetAccessRuleProtection($true, $false)
                                $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "Read", "Allow")
                                $acl.SetAccessRule($rule)
                                Set-Acl -LiteralPath $key -AclObject $acl

                                $envFile = Join-Path $env:WORKSPACE "maxrate.env"
                                @(
                                    "JDBC_URL=$env:JDBC_URL",
                                    "DB_USER=$env:DB_USER",
                                    "DB_PASS=$env:DB_PASS",
                                    "PORT=8080"
                                ) | Set-Content -LiteralPath $envFile -Encoding ascii

                                $serviceFile = Join-Path $env:WORKSPACE "maxrate.service"
                                @"
[Unit]
Description=MaxRate Spring Boot API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu
EnvironmentFile=/etc/maxrate.env
ExecStart=/usr/bin/java -jar /home/ubuntu/app.jar
Restart=always
RestartSec=10
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
"@ | Set-Content -LiteralPath $serviceFile -Encoding ascii

                                scp -i $key -o StrictHostKeyChecking=no $env:APP_JAR "$env:SSH_USER@$env:EC2_HOST`:$env:DEPLOY_PATH"
                                if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

                                scp -i $key -o StrictHostKeyChecking=no $envFile "$env:SSH_USER@$env:EC2_HOST`:/home/ubuntu/maxrate.env"
                                if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

                                scp -i $key -o StrictHostKeyChecking=no $serviceFile "$env:SSH_USER@$env:EC2_HOST`:/home/ubuntu/maxrate.service"
                                if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

                                $remoteCommand = "sudo mv /home/ubuntu/maxrate.env /etc/maxrate.env && sudo chown root:root /etc/maxrate.env && sudo chmod 600 /etc/maxrate.env && sudo mv /home/ubuntu/maxrate.service /etc/systemd/system/maxrate.service && sudo systemctl daemon-reload && sudo systemctl enable maxrate && sudo systemctl restart maxrate && sleep 8 && if sudo systemctl is-active --quiet maxrate; then echo 'maxrate service is running'; else sudo journalctl -u maxrate -n 80 --no-pager; exit 1; fi"
                                ssh -i $key -o StrictHostKeyChecking=no "$env:SSH_USER@$env:EC2_HOST" $remoteCommand
                                if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
                            '''
                        }
                    }
                }
            }
        }
    }
}
