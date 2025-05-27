#!/bin/bash

# Matrix Assignment Analyzer - Deployment Script
# This script helps with local Docker deployment and GitHub Pages setup

set -e

echo "🚀 Matrix Assignment Analyzer Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are available"
}

# Function to run tests
run_tests() {
    print_info "Running tests..."
    docker-compose run --rm test
    print_status "All tests passed!"
}

# Function to build and run development environment
run_development() {
    print_info "Starting development environment..."
    print_info "Building Docker images..."
    docker-compose build app-dev
    
    print_info "Starting development server..."
    docker-compose up -d app-dev
    
    print_status "Development server is running!"
    print_info "Application: http://localhost:5000"
    print_info "To stop: docker-compose down"
}

# Function to build and run production environment
run_production() {
    print_info "Starting production environment..."
    print_info "Building production Docker image..."
    docker-compose build app-prod
    
    print_info "Starting production server..."
    docker-compose up -d app-prod
    
    print_status "Production server is running!"
    print_info "Application: http://localhost:8080"
    print_info "To stop: docker-compose down"
}

# Function to start documentation server
run_docs() {
    print_info "Starting documentation server..."
    docker-compose build docs
    docker-compose up -d docs
    
    print_status "Documentation server is running!"
    print_info "Documentation: http://localhost:3000"
    print_info "To stop: docker-compose down"
}

# Function to build for GitHub Pages
build_for_github_pages() {
    print_info "Building application for GitHub Pages..."
    
    # Build the application
    npm ci
    npm run build:client
    
    # Build documentation
    npx vitepress build docs
    
    print_status "Build completed!"
    print_info "Application built in: dist/public/"
    print_info "Documentation built in: docs/.vitepress/dist/"
}

# Function to show GitHub Pages setup instructions
show_github_pages_setup() {
    echo
    print_info "GitHub Pages Setup Instructions:"
    echo "=================================="
    echo
    echo "1. Push your code to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Add deployment configuration'"
    echo "   git push origin main"
    echo
    echo "2. Enable GitHub Pages in your repository:"
    echo "   - Go to Settings > Pages"
    echo "   - Source: GitHub Actions"
    echo "   - The workflows will automatically deploy on push"
    echo
    echo "3. Your sites will be available at:"
    echo "   📱 Application: https://username.github.io/repository-name/"
    echo "   📚 Documentation: https://username.github.io/repository-name-docs/"
    echo
    print_warning "Remember to update the repository URLs in README.md and workflows!"
}

# Function to clean up Docker resources
cleanup() {
    print_info "Cleaning up Docker resources..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    print_status "Cleanup completed!"
}

# Main menu
show_menu() {
    echo
    echo "Select an option:"
    echo "1) Run tests"
    echo "2) Start development environment"
    echo "3) Start production environment"
    echo "4) Start documentation server"
    echo "5) Build for GitHub Pages"
    echo "6) Show GitHub Pages setup"
    echo "7) Clean up Docker resources"
    echo "8) Exit"
    echo
}

# Main script logic
main() {
    check_docker
    
    while true; do
        show_menu
        read -p "Enter your choice (1-8): " choice
        
        case $choice in
            1)
                run_tests
                ;;
            2)
                run_development
                ;;
            3)
                run_production
                ;;
            4)
                run_docs
                ;;
            5)
                build_for_github_pages
                ;;
            6)
                show_github_pages_setup
                ;;
            7)
                cleanup
                ;;
            8)
                print_status "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi