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
                                scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$APP_JAR" "$SSH_USER@$EC2_HOST:$DEPLOY_PATH"
                                ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_HOST" "pkill -f 'java -jar' || true; JDBC_URL='$JDBC_URL' DB_USER='$DB_USER' DB_PASS='$DB_PASS' nohup java -jar $DEPLOY_PATH > /home/ubuntu/app.log 2>&1 &"
                            '''
                        } else {
                            bat '''
                                scp -i "%SSH_KEY%" -o StrictHostKeyChecking=no "%APP_JAR%" "%SSH_USER%@%EC2_HOST%:%DEPLOY_PATH%"
                                ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no "%SSH_USER%@%EC2_HOST%" "pkill -f 'java -jar' || true; JDBC_URL='%JDBC_URL%' DB_USER='%DB_USER%' DB_PASS='%DB_PASS%' nohup java -jar %DEPLOY_PATH% > /home/ubuntu/app.log 2>&1 &"
                            '''
                        }
                    }
                }
            }
        }
    }
}
