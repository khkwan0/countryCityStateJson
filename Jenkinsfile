pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 20, unit: 'MINUTES')
  }

  tools {
    // Requires a NodeJS installation named "node-20" in Jenkins
    // (Manage Jenkins → Tools → NodeJS).
    nodejs 'node-20'
  }

  environment {
    CI = 'true'
    NODE_ENV = 'test'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('CI') {
      steps {
        sh 'bash scripts/ci.sh'
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'reports/junit/*.xml'
      cleanWs(deleteDirs: true, notFailBuild: true)
    }
    success {
      echo 'countrycitystatejson CI passed'
    }
    failure {
      echo 'countrycitystatejson CI failed — see stage logs'
    }
  }
}
