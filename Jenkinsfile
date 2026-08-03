pipeline {

    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    options {
        timestamps()
        ansiColor('xterm')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        DOCKERHUB_USERNAME = 'shivamrajdocker'

        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-frontend"

        IMAGE_TAG = ""
    }
    stages {

        stage('Prepare') {
            steps {
                script {
                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                        ).trim()
                }
                echo "Image Tag: ${env.IMAGE_TAG}"
            }
        }

        stage('Backend Build & Test') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm run lint'
                    sh 'npm test'
                }
            }
        }

        stage('Frontend Build & Test') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run lint'
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        dir('backend') {
                            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=speedmotors-backend -Dsonar.sources=src"
                        }
                        dir('frontend') {
                            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=speedmotors-frontend -Dsonar.sources=src"
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Docker Build') {
            parallel {

                stage('Backend Image') {
                    steps {
                        sh """
                        docker build \
                        -t ${BACKEND_IMAGE}:${env.IMAGE_TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                        """
                    }
                }

                stage('Frontend Image') {
                    steps {
                        sh """
                        docker build \
                        -t ${FRONTEND_IMAGE}:${env.IMAGE_TAG} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                        """
                    }
                }
            }
        }

//todo--  trivy scan

        stage('Docker Push') {
            parallel {

                stage('Push Backend') {
                    steps {
                        sh """
                        docker push ${BACKEND_IMAGE}:${env.IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        """
                    }
                }

                stage('Push Frontend') {
                    steps {
                        sh """
                        docker push ${FRONTEND_IMAGE}:${env.IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                kubectl set image deployment/backend \
                backend=${BACKEND_IMAGE}:${env.IMAGE_TAG} \
                -n speedmotors
                
                kubectl set image deployment/frontend \
                frontend=${FRONTEND_IMAGE}:${env.IMAGE_TAG} \
                -n speedmotors
                
                kubectl rollout status deployment/backend -n speedmotors
                kubectl rollout status deployment/frontend -n speedmotors
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            sh 'docker image prune -af || true'
            cleanWs()
        }

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}