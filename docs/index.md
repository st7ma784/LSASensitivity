# Matrix Assignment Sensitivity Analyzer

A lightweight web application for interactive matrix editing with real-time linear assignment sensitivity analysis.

## Overview

The Matrix Assignment Sensitivity Analyzer solves the classic **assignment problem** using the Hungarian algorithm and provides real-time sensitivity analysis to understand how changes in cost values affect the optimal assignment.

## Key Features

- **Interactive Matrix Editor**: Click to modify values, with intuitive controls
- **Real-time Optimization**: Instant calculation of optimal assignments
- **Sensitivity Analysis**: See how much each value can change before affecting the solution
- **Dual Optimization Modes**: Support for both minimization and maximization problems
- **Visual Feedback**: Color-coded matrices for easy interpretation

## Mathematical Foundation

The application implements several core mathematical concepts:

### Assignment Problem
Given an $n \times m$ cost matrix $C$, find a one-to-one assignment that optimizes the total cost:

$$\min \sum_{i=1}^{n} \sum_{j=1}^{m} c_{ij} x_{ij}$$

Subject to:
- $\sum_{j=1}^{m} x_{ij} = 1$ for all $i$ (each row assigned)
- $\sum_{i=1}^{n} x_{ij} \leq 1$ for all $j$ (each column assigned at most once)
- $x_{ij} \in \{0, 1\}$ (binary assignment variables)

### Hungarian Algorithm
The Hungarian algorithm finds the optimal solution in $O(n^3)$ time through:

1. **Matrix Reduction**: Subtract row and column minimums
2. **Zero Coverage**: Find minimum line cover of zeros
3. **Augmentation**: Create additional zeros if needed
4. **Assignment**: Extract optimal assignment from zero positions

### Sensitivity Analysis
For each matrix element $c_{ij}$, we calculate the maximum change $\Delta_{ij}$ such that:

$$c_{ij} + \Delta_{ij}$$

does not change the optimal assignment structure.

## Quick Start

1. Adjust matrix dimensions using the sliders
2. Click cells to increase values (+1) or right-click to decrease (-1)
3. Double-click for custom input
4. Toggle between minimize/maximize modes
5. View real-time sensitivity analysis in the adjacent matrix

## Use Cases

- **Resource Allocation**: Assign workers to tasks optimally
- **Cost Optimization**: Minimize transportation or production costs
- **Profit Maximization**: Optimize revenue assignments
- **Scheduling**: Assign time slots to activities
- **Network Flow**: Optimize routing and capacity allocation

## Next Steps

- [Getting Started Guide](/getting-started)
- [Mathematical Theory](/theory/assignment-problem)
- [API Reference](/api/hungarian-algorithm)
- [Usage Examples](/examples/basic-usage)