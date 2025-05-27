# Getting Started

Welcome to the Matrix Assignment Sensitivity Analyzer! This guide will help you get up and running quickly.

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Clone and Setup
```bash
git clone https://github.com/your-username/matrix-assignment-analyzer.git
cd matrix-assignment-analyzer
npm install
```

### Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Basic Usage

### 1. Set Matrix Size
Use the sliders in the control panel to adjust your matrix dimensions:
- **Rows**: 2-8 (workers, tasks, etc.)
- **Columns**: 2-8 (assignments, resources, etc.)

### 2. Edit Matrix Values
- **Left Click**: Increase value by 1
- **Right Click**: Decrease value by 1  
- **Double Click**: Enter custom value

### 3. Choose Optimization Mode
- **Minimize**: Find lowest total cost assignment
- **Maximize**: Find highest total profit assignment

### 4. Interpret Results
- **Cost Matrix**: Your input values with color coding
- **Sensitivity Matrix**: How much each value can change
- **Assignment Score**: Optimal total cost/profit

## Understanding Sensitivity

The sensitivity value tells you how much a cost can change before the optimal assignment changes:

- **∞ (Infinity)**: Can change unlimited amount
- **High numbers (>10)**: Very stable, large changes OK
- **Medium numbers (4-10)**: Moderately sensitive
- **Low numbers (<4)**: Highly sensitive to changes

## Color Guide

### Cost Matrix Colors
- 🔵 **Light Blue**: Low values (0-25)
- 🔷 **Medium Blue**: Medium-low values (26-50) 
- 🟦 **Dark Blue**: Medium-high values (51-75)
- 🌀 **Darkest Blue**: High values (76+)

### Sensitivity Colors
- 🟢 **Green**: Low sensitivity (stable)
- 🟡 **Yellow**: Medium sensitivity
- 🟠 **Orange**: High sensitivity  
- 🔴 **Red**: Very high sensitivity (critical)

## Quick Examples

### Example 1: Worker Assignment
Assign 3 workers to 3 tasks with different skill levels:

```
Workers → Tasks    A    B    C
Worker 1          4    1    3
Worker 2          2    0    5  
Worker 3          3    2    2
```

**Optimal Assignment (Minimize)**:
- Worker 1 → Task B (cost: 1)
- Worker 2 → Task A (cost: 2)  
- Worker 3 → Task C (cost: 2)
- **Total Cost**: 5

### Example 2: Resource Allocation
Maximize profit from assigning resources:

```
Resources → Uses   X    Y    Z
Resource A        3    5    1
Resource B        4    2    6
Resource C        2    3    4
```

**Optimal Assignment (Maximize)**:
- Resource A → Use Y (profit: 5)
- Resource B → Use Z (profit: 6)
- Resource C → Use X (profit: 2)
- **Total Profit**: 13

## Tips for Effective Use

### 1. Start Small
Begin with 3×3 or 4×4 matrices to understand the concepts before scaling up.

### 2. Monitor Sensitivity
Pay attention to red (highly sensitive) cells - small changes here can significantly impact your solution.

### 3. Use What-If Analysis
Before making real-world changes, test them in the application to see if they affect the optimal assignment.

### 4. Consider Multiple Solutions
When sensitivity is very low (near 0), multiple optimal solutions may exist.

## Common Use Cases

### Business Applications
- **Staff Scheduling**: Assign employees to shifts
- **Supply Chain**: Allocate suppliers to products
- **Transportation**: Route vehicles efficiently
- **Project Management**: Assign team members to tasks

### Academic Applications  
- **Operations Research**: Study optimization problems
- **Economics**: Analyze market assignments
- **Computer Science**: Understand algorithmic complexity
- **Mathematics**: Explore combinatorial optimization

## Next Steps

- [Mathematical Theory](/theory/assignment-problem) - Deep dive into the math
- [API Reference](/api/hungarian-algorithm) - Technical documentation
- [Advanced Examples](/examples/advanced) - Complex scenarios

## Troubleshooting

### Performance Issues
- Large matrices (>6×6) may take longer to compute sensitivity
- Consider reducing matrix size for real-time interaction

### Unexpected Results
- Verify input values are correct
- Check that optimization mode (min/max) matches your objective
- Remember that multiple optimal solutions can exist

### Browser Compatibility
- Modern browsers required (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- Recommended: Latest browser versions for best performance