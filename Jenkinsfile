pipeline {
    agent any
    
    environment {
        APP_NAME = "todo-app"
        APP_BLUE = "${APP_NAME}-blue"
        APP_GREEN = "${APP_NAME}-green"
        BACKUP_CONTAINER = "${APP_NAME}-backup"
        MONGO_CONTAINER = "mongo"
        PORT = "3000"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Prepare Environment') {
            steps {
                script {
                    // Create .env file from Jenkins credentials
                    withCredentials([
                        string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI'),
                        string(credentialsId: 'NODE_ENV', variable: 'NODE_ENV')
                    ]) {
                        sh '''
                        echo "MONGO_URI=$MONGO_URI" > .env
                        echo "NODE_ENV=$NODE_ENV" >> .env
                        echo "PORT=3000" >> .env
                        '''
                    }
                    
                    // Check if MongoDB container is running, if not, start it
                    def mongoRunning = sh(script: "docker ps -q -f name=${MONGO_CONTAINER}", returnStdout: true).trim()
                    if (!mongoRunning) {
                        echo "MongoDB container not running. Starting it..."
                        sh "docker-compose up -d mongo"
                        sh "sleep 10" // Give MongoDB time to initialize
                    } else {
                        echo "MongoDB container already running, ensuring data persistence..."
                    }
                }
            }
        }
        
        stage('Determine Deployment Strategy') {
            steps {
                script {
                    // Check which containers exist
                    def blueExists = sh(script: "docker ps -a -q -f name=${APP_BLUE}", returnStdout: true).trim()
                    def greenExists = sh(script: "docker ps -a -q -f name=${APP_GREEN}", returnStdout: true).trim()
                    def prodExists = sh(script: "docker ps -a -q -f name=${APP_NAME}", returnStdout: true).trim()
                    def backupExists = sh(script: "docker ps -a -q -f name=${BACKUP_CONTAINER}", returnStdout: true).trim()
                    
                    // Determine which color to deploy next
                    if (prodExists) {
                        // Get the color label from the production container if it exists
                        def containerColor = sh(script: "docker inspect ${APP_NAME} --format '{{index .Config.Labels \"color\"}}' 2>/dev/null || echo 'unknown'", returnStdout: true).trim()
                        
                        env.CURRENT_COLOR = containerColor != "unknown" ? containerColor : "blue"
                        env.TARGET_COLOR = env.CURRENT_COLOR == "blue" ? "green" : "blue"
                        env.TARGET_CONTAINER = env.TARGET_COLOR == "blue" ? APP_BLUE : APP_GREEN
                    } else if (blueExists || greenExists) {
                        // If no prod but blue or green exists, use the opposite
                        env.CURRENT_COLOR = blueExists ? "blue" : "green"
                        env.TARGET_COLOR = env.CURRENT_COLOR == "blue" ? "green" : "blue"
                        env.TARGET_CONTAINER = env.TARGET_COLOR == "blue" ? APP_BLUE : APP_GREEN
                    } else {
                        // First deployment - start with blue
                        env.CURRENT_COLOR = "none"
                        env.TARGET_COLOR = "blue"
                        env.TARGET_CONTAINER = APP_BLUE
                    }
                    
                    // Save current state for potential rollback in post section
                    env.BEFORE_DEPLOYMENT_PROD_EXISTS = prodExists ? "true" : "false"
                    if (prodExists) {
                        env.BEFORE_DEPLOYMENT_PROD_COLOR = env.CURRENT_COLOR
                    }
                    
                    // Cleanup strategy for backup
                    if (backupExists) {
                        echo "Backup container exists and will be removed"
                        sh "docker stop ${BACKUP_CONTAINER} || true"
                        sh "docker rm ${BACKUP_CONTAINER} || true"
                    }
                    
                    echo "Deployment strategy: Current=${env.CURRENT_COLOR}, Target=${env.TARGET_COLOR} (${env.TARGET_CONTAINER})"
                }
            }
        }
        
        stage('Build and Deploy New Version') {
            steps {
                script {
                    // Create docker-compose override file for this deployment
                    sh """
                    cat <<EOF > docker-compose.override.yml
version: "3.8"
services:
  app:
    container_name: ${env.TARGET_CONTAINER}
    labels:
      color: ${env.TARGET_COLOR}
      deployed: "\$(date +'%Y-%m-%d-%H-%M-%S')"
EOF
                    """
                    
                    // Stop the target container if it already exists
                    sh "docker stop ${env.TARGET_CONTAINER} || true"
                    sh "docker rm ${env.TARGET_CONTAINER} || true"
                    
                    // Build and start the new version
                    sh "docker-compose build app"
                    sh "docker-compose up -d app"
                    
                    // Give the app time to start
                    sh "sleep 10"
                }
            }
        }
        
        stage('Verify New Deployment') {
            steps {
                script {
                    // Check if the new container is running
                    def newContainerRunning = sh(script: "docker ps -q -f name=${env.TARGET_CONTAINER}", returnStdout: true).trim()
                    if (!newContainerRunning) {
                        error "New container failed to start: ${env.TARGET_CONTAINER}"
                    }
                    
                    // Health check the application using the root path (/)
                    try {
                        def statusCode = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${PORT}/ || echo 'failed'", returnStdout: true).trim()
                        
                        if (statusCode != "200") {
                            // Try to get logs for debugging
                            sh "docker logs ${env.TARGET_CONTAINER}"
                            error "Application health check failed with status ${statusCode}"
                        }
                        
                        echo "New deployment health check passed"
                    } catch (Exception e) {
                        sh "docker logs ${env.TARGET_CONTAINER}"
                        error "Health check failed: ${e.message}"
                    }
                }
            }
        }
        
        stage('Switch Traffic') {
            steps {
                script {
                    // Check if production app is running
                    def prodExists = sh(script: "docker ps -a -q -f name=${APP_NAME}", returnStdout: true).trim()
                    
                    if (prodExists) {
                        echo "Moving current production container to backup"
                        sh "docker stop ${APP_NAME} || true"
                        sh "docker rename ${APP_NAME} ${BACKUP_CONTAINER}"
                    }
                    
                    // Rename the new container to production
                    echo "Switching traffic to new deployment: ${env.TARGET_CONTAINER} → ${APP_NAME}"
                    sh "docker rename ${env.TARGET_CONTAINER} ${APP_NAME}"
                    
                    // Make sure the new production container is running
                    sh "docker start ${APP_NAME} || true"
                    
                    // Verify the switch was successful
                    sh "sleep 5"
                    def prodRunning = sh(script: "docker ps -q -f name=${APP_NAME}", returnStdout: true).trim()
                    if (!prodRunning) {
                        error "Failed to switch traffic - production container not running"
                    }
                }
            }
        }
        
        stage('Final Verification') {
            steps {
                script {
                    // Final application health check
                    try {
                        // Using curl to check the root path (/)
                        def statusCode = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${PORT}/ || echo 'failed'", returnStdout: true).trim()
                        
                        if (statusCode != "200") {
                            error "Final verification failed with status ${statusCode}"
                        }
                        
                        echo "Deployment complete and verified"
                    } catch (Exception e) {
                        error "Final verification failed: ${e.message}"
                    }
                }
            }
        }
    }
    
    post {
        failure {
            script {
                echo 'Deployment failed - attempting rollback'
                
                // Check the state of containers after failure
                def prodExists = sh(script: "docker ps -a -q -f name=${APP_NAME}", returnStdout: true).trim()
                def backupExists = sh(script: "docker ps -a -q -f name=${BACKUP_CONTAINER}", returnStdout: true).trim()
                def targetExists = sh(script: "docker ps -a -q -f name=${env.TARGET_CONTAINER}", returnStdout: true).trim()
                
                // Rollback strategy depends on what stage failed
                if (backupExists) {
                    // We have a backup container, which means we were in the process of switching traffic
                    echo "Backup container exists - rolling back to previous version"
                    
                    // Remove the failed production container if it exists
                    if (prodExists) {
                        sh "docker stop ${APP_NAME} || true"
                        sh "docker rm ${APP_NAME} || true"
                    }
                    
                    // Restore from backup
                    echo "Restoring from backup container"
                    sh "docker rename ${BACKUP_CONTAINER} ${APP_NAME}"
                    sh "docker start ${APP_NAME} || true"
                    
                    // Check if rollback was successful
                    def rolledBackContainerRunning = sh(script: "docker ps -q -f name=${APP_NAME}", returnStdout: true).trim()
                    if (!rolledBackContainerRunning) {
                        echo "WARNING: Rollback container failed to start"
                    } else {
                        echo "Rollback successful - previous version restored"
                    }
                } else if (targetExists) {
                    // Target container exists but backup doesn't - we failed before switching traffic
                    echo "Target container exists but deployment failed before traffic switch"
                    
                    // Just clean up the failed target container
                    sh "docker stop ${env.TARGET_CONTAINER} || true"
                    sh "docker rm ${env.TARGET_CONTAINER} || true"
                    
                    echo "Cleaned up failed deployment, current production unchanged"
                } else if (env.BEFORE_DEPLOYMENT_PROD_EXISTS == "true") {
                    // We lost both backup and target containers, but production existed before deployment
                    echo "WARNING: Both target and backup containers are missing, but production existed before deployment"
                    echo "Unable to perform rollback - manual intervention may be required"
                } else {
                    // First deployment and it failed
                    echo "Initial deployment failed - no previous version to roll back to"
                }
                
                // Always try to clean up any residual containers to avoid confusion
                sh "docker ps -a | grep ${APP_NAME} || true"
            }
        }
        success {
            script {
                echo "Blue-green deployment successful!"
                echo "Current deployment color: ${env.TARGET_COLOR}"
                
                // Update the color label on the production container
                sh "docker label ${APP_NAME} color=${env.TARGET_COLOR} || true"
            }
        }
        always {
            // Cleanup temporary files
            sh "rm -f docker-compose.override.yml || true"
            
            // Show current container state
            echo "Current container state:"
            sh "docker ps -a | grep ${APP_NAME} || true"
            sh "docker ps -a | grep ${MONGO_CONTAINER} || true"
        }
    }
}