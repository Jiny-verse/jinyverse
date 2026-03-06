pipeline {
    agent any

    environment {
        COMPOSE_DOCKER_CLI_BUILD = 1
        DOCKER_BUILDKIT = 1
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building updated Docker images for Jinyverse (Production)...'
                // Uses default docker-compose.yml
                sh 'docker compose build'
            }
        }

        stage('Deploy (Up/Restart)') {
            steps {
                echo 'Deploying to Oracle Cloud Production Environment...'
                // Uses default docker-compose.yml and .env (copied from .env.example on server)
                sh 'docker compose up -d'
            }
        }

        stage('Clean / Prune') {
            steps {
                echo 'Pruning dangling images to save disk space...'
                sh 'docker image prune -f'
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished.'
        }
    }
}
