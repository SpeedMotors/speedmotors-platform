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

        DOCKER_BUILDKIT = "1"

        DOCKERHUB_USERNAME = "shivamrajdocker"

        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/speedmotors-frontend"

        IMAGE_TAG = ""

        BACKEND_CHANGED = "false"
        FRONTEND_CHANGED = "false"
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

                    echo "Image Tag : ${env.IMAGE_TAG}"

                }
            }
        }

        stage('Detect Changes') {
            steps {
                
                script {
                
                    env.BACKEND_CHANGED = "false"
                    env.FRONTEND_CHANGED = "false"
                    
                    if (currentBuild.changeSets.isEmpty()) {
                        echo "No changelog found. Building everything."
                        
                        env.BACKEND_CHANGED = "true"
                        env.FRONTEND_CHANGED = "true"
                    } else {
                        currentBuild.changeSets.each { changeSet ->

                    changeSet.items.each { item ->

                        item.affectedFiles.each { file ->

                            if (file.path.startsWith("backend/")) {
                                env.BACKEND_CHANGED = "true"
                            }

                            if (file.path.startsWith("frontend/")) {
                                env.FRONTEND_CHANGED = "true"
                            }

                        }

                    }

                }

            }

            echo "Backend Changed : ${env.BACKEND_CHANGED}"
            echo "Frontend Changed : ${env.FRONTEND_CHANGED}"

        }

    }

}

        stage('Backend Build & Test') {

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

        stage('Frontend Build & Test') {

            when {
                expression { env.FRONTEND_CHANGED == "true" }
            }

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

                        if (env.BACKEND_CHANGED == "true") {

                            dir('backend') {

                                sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=speedmotors-backend \
                                -Dsonar.projectName=SpeedMotors-Backend \
                                -Dsonar.sources=src
                                """

                            }

                        }

                        if (env.FRONTEND_CHANGED == "true") {

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

                    when {
                        expression { env.BACKEND_CHANGED == "true" }
                    }

                    steps {

                        sh """
                        docker build \
                        --pull \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                        """

                    }

                }

                stage('Frontend Image') {

                    when {
                        expression { env.FRONTEND_CHANGED == "true" }
                    }

                    steps {

                        sh """
                        docker build \
                        --pull \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
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

                    when {
                        expression { env.BACKEND_CHANGED == "true" }
                    }

                    steps {

                        sh """
                        trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --no-progress \
                        ${BACKEND_IMAGE}:${IMAGE_TAG}
                        """

                    }

                }

                stage('Frontend Scan') {

                    when {
                        expression { env.FRONTEND_CHANGED == "true" }
                    }

                    steps {

                        sh """
                        trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --no-progress \
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
                        expression { env.BACKEND_CHANGED == "true" }
                    }

                    steps {

                        sh """
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        """

                    }

                }

                stage('Push Frontend') {

                    when {
                        expression { env.FRONTEND_CHANGED == "true" }
                    }

                    steps {

                        sh """
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
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

                        if (env.BACKEND_CHANGED == "true") {

                            sh """
                            kubectl set image deployment/backend \
                            backend=${BACKEND_IMAGE}:${IMAGE_TAG} \
                            -n speedmotors
                            """

                        }

                        if (env.FRONTEND_CHANGED == "true") {

                            sh """
                            kubectl set image deployment/frontend \
                            frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} \
                            -n speedmotors
                            """

                        }

                        if (env.BACKEND_CHANGED == "true") {

                            sh '''
                            kubectl rollout status deployment/backend \
                            -n speedmotors
                            '''

                        }

                        if (env.FRONTEND_CHANGED == "true") {

                            sh '''
                            kubectl rollout status deployment/frontend \
                            -n speedmotors
                            '''

                        }

                    } catch(Exception e) {

                        echo "Deployment failed. Rolling back..."

                        if (env.BACKEND_CHANGED == "true") {

                            sh '''
                            kubectl rollout undo deployment/backend \
                            -n speedmotors
                            '''

                        }

                        if (env.FRONTEND_CHANGED == "true") {

                            sh '''
                            kubectl rollout undo deployment/frontend \
                            -n speedmotors
                            '''

                        }

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
                
                curl --fail http://http://3.6.111.114/api/health
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