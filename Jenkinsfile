pipeline {

    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    options {
        timestamps()
        ansiColor('xterm')  
        disableConcurrentBuilds()  //queues the parallel build - wait until first finishes
        buildDiscarder(logRotator(
                numToKeepStr: '20',
                artifactNumToKeepStr: '20'
        ))
    }

    environment {

        DOCKERHUB_USERNAME = "shivamrajdocker"

        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"

        BACKEND_CHANGED = "false"
        FRONTEND_CHANGED = "false"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Detect Changes') {

            steps {

                script {

    def changedFiles = sh(
        script: '''
            if git rev-parse HEAD~1 >/dev/null 2>&1
            then
                git diff --name-only HEAD~1 HEAD
            else
                echo "__FIRST_BUILD__"
            fi
        ''',
        returnStdout: true
    ).trim()

    if (changedFiles.contains("__FIRST_BUILD__")) {

        env.BACKEND_CHANGED = "true"
        env.FRONTEND_CHANGED = "true"

    } else {

        if (changedFiles.contains("backend/")) {
            env.BACKEND_CHANGED = "true"
        }

        if (changedFiles.contains("frontend/")) {
            env.FRONTEND_CHANGED = "true"
        }

    }
}

        stage('Build & Test') {

            parallel {

                stage('Backend') {

                    when {
                        expression {
                            env.BACKEND_CHANGED == "true"
                        }
                    }

                    steps {

                        dir('backend') {

                            sh 'npm ci'

                            sh 'npm test'

                        }

                    }

                }

                stage('Frontend') {

                    when {
                        expression {
                            env.FRONTEND_CHANGED == "true"
                        }
                    }

                    steps {

                        dir('frontend') {

                            sh 'npm ci'

                            sh 'npm run build'

                        }

                    }

                }

            }

        }
//code quality analysis -check you code
        stage('SonarQube Analysis') {

            parallel {

                stage('Backend Scan') {

                    when {
                        expression {
                            env.BACKEND_CHANGED == "true"
                        }
                    }

                    steps {

                        dir('backend') {

                            withSonarQubeEnv('SonarQube') {

                                sh '''
                                sonar-scanner \
                                -Dsonar.projectKey=speedmotors-backend \
                                -Dsonar.sources=. \
                                -Dsonar.projectName=speedmotors-backend
                                '''

                            }

                        }

                    }

                }

                stage('Frontend Scan') {

                    when {
                        expression {
                            env.FRONTEND_CHANGED == "true"
                        }
                    }

                    steps {

                        dir('frontend') {

                            withSonarQubeEnv('SonarQube') {       //auto provides configured environment variables

                                sh '''
                                sonar-scanner \
                                -Dsonar.projectKey=speedmotors-frontend \
                                -Dsonar.sources=. \
                                -Dsonar.projectName=speedmotors-frontend
                                '''

                            }

                        }

                    }

                }

            }

        }
//does this code passes quality check?
        stage('Quality Gate') {

            when {
                expression {
                    env.BACKEND_CHANGED == "true" ||
                    env.FRONTEND_CHANGED == "true"
                }
            }

            steps {

                timeout(time: 5, unit: 'MINUTES') {

                    waitForQualityGate abortPipeline: true

               }

            }

}
//authentication before image push
        stage('Docker Login') {

            when {
                expression {
                    env.BACKEND_CHANGED == "true" ||
                    env.FRONTEND_CHANGED == "true"
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

                    when {
                        expression {
                            env.BACKEND_CHANGED == "true"
                        }
                    }

                    steps {

                        sh """
                        docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        backend
                        """

                    }

                }

                stage('Frontend Image') {

                    when {
                        expression {
                            env.FRONTEND_CHANGED == "true"
                        }
                    }

                    steps {

                        sh """
                        docker build \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        frontend
                        """

                    }

                }

            }

        }
//scan entire docker images - check the container
        stage('Trivy Scan') {

            parallel {

                stage('Backend Security') {

                    when {
                        expression {
                            env.BACKEND_CHANGED == "true"
                        }
                    }

                    steps {

                        sh """
                        trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        ${BACKEND_IMAGE}:${IMAGE_TAG}
                        """

                    }

                }

                stage('Frontend Security') {

                    when {
                        expression {
                            env.FRONTEND_CHANGED == "true"
                        }
                    }

                    steps {

                        sh """
                        trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        """

                    }

                }

            }

        }

        stage('Docker Push') {

            parallel {

                stage('Push Backend') {

                    when {
                        expression {
                            env.BACKEND_CHANGED == "true"
                        }
                    }

                    steps {

                        sh """
                        docker push \
                        ${BACKEND_IMAGE}:${IMAGE_TAG}
                        """

                    }

                }

                stage('Push Frontend') {

                    when {
                        expression {
                            env.FRONTEND_CHANGED == "true"
                        }
                    }

                    steps {

                        sh """
                        docker push \
                        ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        """

                    }

                }

            }

        }

    }

    post {

        always {

            sh '''
            docker logout || true

            docker image prune -af || true
            '''

            cleanWs()

        }

        success {

            echo "Pipeline Completed Successfully"

        }

        failure {

            echo "Pipeline Failed"

        }

    }

}