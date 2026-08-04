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
        timeout(time: 45, unit: 'MINUTES')
    }

    environment {

        DOCKERHUB_USERNAME = "shivamrajdocker"

        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-frontend"

        IMAGE_TAG = ""

    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare') {
            steps {
                script {
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                ).trim()}"

                 echo "IMAGE_TAG = ${env.IMAGE_TAG}"
                }
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
                            sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=speedmotors-backend \
                            -Dsonar.projectName=SpeedMotors-Backend \
                            -Dsonar.sources=src
                            """
                        }
                        dir('frontend') {
                            sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=speedmotors-frontend \
                            -Dsonar.projectName=SpeedMotors-Frontend \
                            -Dsonar.sources=src
                             """
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
                    sh '''
                    echo "$DOCKER_PASS" | docker login \
                    -u "$DOCKER_USER" \
                    --password-stdin
                    '''
                }
            }
        }

        stage('Docker Build') {
            parallel {

                stage('Backend Image') {
                    steps {
                        sh """
                        docker build \
                        --pull \
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
                        --pull \
                        -t ${FRONTEND_IMAGE}:${env.IMAGE_TAG} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                        """
                    }
                }
            }
        }

        stage('Trivy Scan') {
            parallel {

                stage('Backend Scan') {
                    steps {
                        sh """
                        trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --no-progress \
                        ${BACKEND_IMAGE}:${env.IMAGE_TAG}
                        """
                    }
                }

                stage('Frontend Scan') {
                    steps {
                        sh """
                        trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --no-progress \
                        ${FRONTEND_IMAGE}:${env.IMAGE_TAG}
                        """
                    }
                }
            }
        }

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
                script {
                    try {
                        sh """
                        kubectl set image deployment/backend \
                        backend=${BACKEND_IMAGE}:${env.IMAGE_TAG} \
                        -n speedmotors
                        """

                        sh """
                        kubectl set image deployment/frontend \
                        frontend=${FRONTEND_IMAGE}:${env.IMAGE_TAG} \
                        -n speedmotors
                        """

                        sh '''
                        kubectl rollout status deployment/backend \
                        -n speedmotors
                        '''

                        sh '''
                        kubectl rollout status deployment/frontend \
                        -n speedmotors
                        '''
                    } catch (Exception e) {
                        echo "Deployment failed. Rolling back..."

                        sh '''
                        kubectl rollout undo deployment/backend \
                        -n speedmotors
                        '''

                        sh '''
                        kubectl rollout undo deployment/frontend \
                        -n speedmotors
                        '''

                        error("Deployment failed and rollback executed.")
                    }
                }
            }
        }

        stage('Deployment Verification') {
            steps {
                sh '''
                kubectl get pods -n speedmotors
                kubectl get svc -n speedmotors
                kubectl get ingress -n speedmotors
                '''
            }
        }
    }

    post {

        always {
            sh 'docker logout || true'
            sh 'docker image prune -f || true'
            cleanWs()
        }

        success {
            echo '''
            ==========================================
             SpeedMotors Deployment Successful
            ==========================================
            '''
        }

        failure {
            echo '''
            ==========================================
             SpeedMotors Deployment Failed
             Rollback Completed
            ==========================================
            '''
        }

    }

}