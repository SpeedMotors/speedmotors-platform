pipeline {

    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    options {
        timestamps()
        ansiColor('xterm')
        disableConcurrentBuilds()

        buildDiscarder(logRotator(
            numToKeepStr: '20',
            artifactNumToKeepStr: '20'
        ))
    }

    environment {

        DOCKERHUB_USERNAME = 'shivamrajdocker'

        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-frontend"

        IMAGE_TAG = ''

        BACKEND_CHANGED = 'false'
        FRONTEND_CHANGED = 'false'
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

                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Git SHA      : ${env.IMAGE_TAG}"
                    echo "Backend Image: ${env.BACKEND_IMAGE}:${env.IMAGE_TAG}"
                    echo "Frontend Image: ${env.FRONTEND_IMAGE}:${env.IMAGE_TAG}"

                }
            }
        }

        stage('Detect Changes') {
            steps {
                script {

                    def changedFiles = sh(
                        script: '''
                            if git rev-parse HEAD~1 >/dev/null 2>&1; then
                                git diff --name-only HEAD~1 HEAD
                            else
                                git ls-files
                            fi
                        ''',
                        returnStdout: true
                    ).trim()

                    echo "Changed Files:"
                    echo changedFiles

                    env.BACKEND_CHANGED = "false"
                    env.FRONTEND_CHANGED = "false"

                    if (!changedFiles) {

                        env.BACKEND_CHANGED = "true"
                        env.FRONTEND_CHANGED = "true"

                    } else {

                        changedFiles.split("\\n").each { file ->

                            file = file.trim()

                            if (file.startsWith("backend/")) {
                                env.BACKEND_CHANGED = "true"
                            }

                            if (file.startsWith("frontend/")) {
                                env.FRONTEND_CHANGED = "true"
                            }
                        }
                    }

                    echo "Backend Changed : ${env.BACKEND_CHANGED}"
                    echo "Frontend Changed: ${env.FRONTEND_CHANGED}"
                }
            }
        }
                stage('Build & Test') {
            parallel {

                stage('Backend') {
                    when {
                        expression { env.BACKEND_CHANGED == "true" }
                    }

                    steps {
                        dir('backend') {

                            sh 'npm ci'

                            sh 'npm run lint'

                            sh 'npm test'

                        }
                    }
                }

                stage('Frontend') {
                    when {
                        expression { env.FRONTEND_CHANGED == "true" }
                    }

                    steps {
                        dir('frontend') {

                            sh 'npm ci'

                            sh 'npm run lint'

                            sh 'npm test'

                            sh 'npm run build'

                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression {
                    env.BACKEND_CHANGED == "true" || env.FRONTEND_CHANGED == "true"
                }
            }

            parallel {

                stage('Backend Scan') {
                    when {
                        expression { env.BACKEND_CHANGED == "true" }
                    }

                    steps {
                        withSonarQubeEnv('SonarQube') {

                            dir('backend') {

                                sh """
                                sonar-scanner \
                                  -Dsonar.projectKey=speedmotors-backend \
                                  -Dsonar.sources=src
                                """

                            }

                        }
                    }
                }

                stage('Frontend Scan') {
                    when {
                        expression { env.FRONTEND_CHANGED == "true" }
                    }

                    steps {
                        withSonarQubeEnv('SonarQube') {

                            dir('frontend') {

                                sh """
                                sonar-scanner \
                                  -Dsonar.projectKey=speedmotors-frontend \
                                  -Dsonar.sources=src
                                """

                            }

                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            when {
                expression {
                    env.BACKEND_CHANGED == "true" || env.FRONTEND_CHANGED == "true"
                }
            }

            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
                stage('Docker Login') {
            when {
                expression {
                    env.BACKEND_CHANGED == "true" || env.FRONTEND_CHANGED == "true"
                }
            }

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
            when {
                expression {
                    env.BACKEND_CHANGED == "true" || env.FRONTEND_CHANGED == "true"
                }
            }

            parallel {

                stage('Build Backend Image') {
                    when {
                        expression { env.BACKEND_CHANGED == "true" }
                    }

                    steps {
                        sh """
                        docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        ./backend
                        """
                    }
                }

                stage('Build Frontend Image') {
                    when {
                        expression { env.FRONTEND_CHANGED == "true" }
                    }

                    steps {
                        sh """
                        docker build \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        ./frontend
                        """
                    }
                }
            }
        }

        stage('Trivy Scan') {
            when {
                expression {
                    env.BACKEND_CHANGED == "true" || env.FRONTEND_CHANGED == "true"
                }
            }

            parallel {

                stage('Backend Scan') {
                    when {
                        expression { env.BACKEND_CHANGED == "true" }
                    }

                    steps {
                        sh "trivy image --exit-code 0 ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    }
                }

                stage('Frontend Scan') {
                    when {
                        expression { env.FRONTEND_CHANGED == "true" }
                    }

                    steps {
                        sh "trivy image --exit-code 0 ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    }
                }
            }
        }

        stage('Docker Push') {
            when {
                expression {
                    env.BACKEND_CHANGED == "true" || env.FRONTEND_CHANGED == "true"
                }
            }

            parallel {

                stage('Push Backend') {
                    when {
                        expression { env.BACKEND_CHANGED == "true" }
                    }

                    steps {
                        sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    }
                }

                stage('Push Frontend') {
                    when {
                        expression { env.FRONTEND_CHANGED == "true" }
                    }

                    steps {
                        sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    }
                }
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